import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
        const { id } = await params;
        const body = await request.json();
        const { date, status, clientId, paymentMethod } = body;
        const paidPrice = body.paidPrice !== undefined ? Number(body.paidPrice) : undefined;

        // Use transaction to ensure consistency
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update the main appointment fields
            const updatedAppointment = await tx.appointment.update({
                where: { id },
                data: {
                    date: date ? new Date(date) : undefined,
                    status,
                    clientId,
                    paymentMethod,
                    paidPrice,
                },
                include: {
                    services: {
                        include: { service: true }
                    }
                }
            });

            // 2. If paidPrice is updated, distribute it among services
            if (paidPrice !== undefined) {
                const appointmentServices = updatedAppointment.services;

                if (appointmentServices.length > 0) {
                    const currentTotal = appointmentServices.reduce((sum, s) => sum + Number(s.priceSnapshot), 0);

                    // Distribute new price proportionally
                    if (currentTotal > 0) {
                        let remaining = paidPrice;

                        for (let i = 0; i < appointmentServices.length; i++) {
                            const appService = appointmentServices[i];
                            let newSnapshot = 0;

                            if (i === appointmentServices.length - 1) {
                                // Last item gets the remainder to ensure exact match
                                newSnapshot = remaining;
                            } else {
                                const weight = Number(appService.priceSnapshot) / currentTotal;
                                newSnapshot = Math.round((paidPrice * weight) * 100) / 100;
                            }

                            remaining -= newSnapshot;

                            await tx.appointmentService.update({
                                where: { id: appService.id },
                                data: { priceSnapshot: newSnapshot }
                            });
                        }
                    } else {
                        // Edge case: current total is 0, distribute equally
                        const share = paidPrice / appointmentServices.length;
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
                    services: { include: { service: true } },
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
