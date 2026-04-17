import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// Correctly type the params argument for dynamic routes in App Router
export async function DELETE(
    request: Request,
    { params }: { params: any }
) {
    try {
        const { id } = await params;
        await prisma.appointment.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete appointment" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: any }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        const { id } = await params;
        const body = await request.json();
        const { 
            date, status, clientId, paymentMethod, 
            useCreditForServiceId, buyPackageServiceId, buyPackageAmount, 
            serviceIds, saveAsCredit, registerAsDebt, useWalletBalance 
        } = body;
        const paidPriceInput = body.paidPrice !== undefined ? Number(body.paidPrice) : undefined;

        // Use transaction to ensure consistency
        const result = await prisma.$transaction(async (tx) => {
            // 0. Get current client data for wallet balance
            const currentAppt = await tx.appointment.findUnique({ 
                where: { id },
                select: { clientId: true }
            });
            const targetClientId = clientId || currentAppt?.clientId;
            const client = await tx.client.findUnique({
                where: { id: targetClientId },
                select: { balance: true }
            });
            const oldBalance = Number(client?.balance || 0);

            // 1. Handle service updates if serviceIds is provided
            let totalDurationMinutes = undefined;
            if (serviceIds && Array.isArray(serviceIds)) {
                const servicesData = await tx.service.findMany({
                    where: { id: { in: serviceIds } }
                });
                if (servicesData.length !== serviceIds.length) {
                    throw new Error("Um ou mais serviços não encontrados");
                }
                await tx.appointmentService.deleteMany({ where: { appointmentId: id } });
                await tx.appointmentService.createMany({
                    data: servicesData.map((s, index) => ({
                        appointmentId: id,
                        serviceId: s.id,
                        priceSnapshot: s.price,
                        order: index + 1
                    }))
                });
                totalDurationMinutes = servicesData.reduce((sum, s) => sum + s.duration, 0);
            }

            // Fetch the services again (including snapshots) to get the total
            const apptWithServices = await tx.appointment.findUniqueOrThrow({
                where: { id },
                include: { services: true }
            });
            const serviceTotal = apptWithServices.services.reduce((sum, s) => sum + Number(s.priceSnapshot), 0);

            // 2. Calculate final revenue and wallet changes
            let revenueForReport = paidPriceInput;
            let finalBalanceChange = 0;

            if (status === 'COMPLETED' && paidPriceInput !== undefined) {
                const actualPaid = paidPriceInput;
                const surplus = actualPaid - serviceTotal;
                
                // Logic for balance change
                if (surplus > 0) {
                    // Paid more than service
                    if (saveAsCredit) {
                        finalBalanceChange = surplus;
                        // Revenue today is only the service value + any old debt being cleared
                        const debtBeingCleared = oldBalance < 0 ? Math.min(Math.abs(oldBalance), surplus) : 0;
                        revenueForReport = serviceTotal + debtBeingCleared;
                    } else {
                        // Andreia charged more (no credit)
                        finalBalanceChange = 0;
                        revenueForReport = actualPaid;
                    }
                } else if (surplus < 0) {
                    // Paid less than service
                    if (registerAsDebt) {
                        finalBalanceChange = surplus;
                        revenueForReport = actualPaid;
                    } else {
                        // It was a discount
                        finalBalanceChange = 0;
                        revenueForReport = actualPaid;
                    }
                } else {
                    finalBalanceChange = 0;
                    revenueForReport = actualPaid;
                }

                // Handle using existing wallet credit
                if (useWalletBalance && oldBalance > 0) {
                    const amountToUse = Math.min(oldBalance, Math.max(0, serviceTotal - actualPaid));
                    finalBalanceChange -= amountToUse;
                    revenueForReport = (revenueForReport || 0) + amountToUse;
                }

                // Apply balance change and history
                if (finalBalanceChange !== 0) {
                    await tx.client.update({
                        where: { id: targetClientId },
                        data: { balance: { increment: finalBalanceChange } }
                    });

                    await tx.walletHistory.create({
                        data: {
                            clientId: targetClientId!,
                            amount: finalBalanceChange,
                            description: (() => {
                                if (finalBalanceChange > 0) return `Crédito guardado (Agendamento)`;
                                if (registerAsDebt) return `Dívida registrada (Pagar depois)`;
                                return `Crédito utilizado (Agendamento)`;
                            })(),
                            appointmentId: id
                        }
                    });
                }
            }

            // 3. Update the main appointment fields
            const updatedAppointment = await tx.appointment.update({
                where: { id },
                data: {
                    date: date ? new Date(date) : undefined,
                    status,
                    clientId,
                    paymentMethod,
                    paidPrice: revenueForReport,
                    totalDurationMinutes,
                },
                include: {
                    services: {
                        include: { service: true }
                    }
                }
            });

            // 4. Handle Service Credits (Packages) if completed
            if (status === 'COMPLETED') {
                if (useCreditForServiceId) {
                    await tx.clientCredit.update({
                        where: { clientId_serviceId: { clientId: targetClientId!, serviceId: useCreditForServiceId } },
                        data: { balance: { decrement: 1 } }
                    });
                    await tx.creditHistory.create({
                        data: {
                            clientId: targetClientId!,
                            serviceId: useCreditForServiceId,
                            amount: -1,
                            reason: `Abatido no agendamento ${id}`
                        }
                    });
                }

                if (buyPackageServiceId && buyPackageAmount) {
                    const amt = parseInt(buyPackageAmount, 10);
                    if (amt > 0) {
                        await tx.clientCredit.upsert({
                            where: { clientId_serviceId: { clientId: targetClientId!, serviceId: buyPackageServiceId } },
                            update: { balance: { increment: amt } },
                            create: { clientId: targetClientId!, serviceId: buyPackageServiceId, balance: amt }
                        });
                        await tx.creditHistory.create({
                            data: {
                                clientId: targetClientId!,
                                serviceId: buyPackageServiceId,
                                amount: amt,
                                reason: `Pacote adquirido no agendamento ${id}`
                            }
                        });
                    }
                }
            }

            // 3. If paidPrice is updated, distribute it among the (potentially new) services
            if (paidPriceInput !== undefined) {
                const appointmentServices = updatedAppointment.services;

                if (appointmentServices.length > 0) {
                    const currentTotal = appointmentServices.reduce((sum, s) => sum + Number(s.priceSnapshot), 0);

                    if (currentTotal > 0) {
                        let remaining = Number(revenueForReport || 0);

                        for (let i = 0; i < appointmentServices.length; i++) {
                            const appService = appointmentServices[i];
                            let newSnapshot = 0;

                            if (i === appointmentServices.length - 1) {
                                newSnapshot = remaining;
                            } else {
                                const weight = Number(appService.priceSnapshot) / currentTotal;
                                newSnapshot = Math.round((Number(revenueForReport || 0) * weight) * 100) / 100;
                            }

                            remaining -= newSnapshot;

                            await tx.appointmentService.update({
                                where: { id: appService.id },
                                data: { priceSnapshot: newSnapshot }
                            });
                        }
                    } else {
                        const share = Number(revenueForReport || 0) / appointmentServices.length;
                        for (const s of appointmentServices) {
                            await tx.appointmentService.update({
                                where: { id: s.id },
                                data: { priceSnapshot: share }
                            });
                        }
                    }
                }
            }

            // Return the fresh data with updated services
            return await tx.appointment.findUniqueOrThrow({
                where: { id },
                include: {
                    services: { include: { service: true }, orderBy: { order: 'asc' } },
                    client: true
                }
            });
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Failed to update appointment:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update appointment" },
            { status: 500 }
        );
    }
}

