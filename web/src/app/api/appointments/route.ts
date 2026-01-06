
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    // Optional: filter by date if needed for optimization
    // const date = searchParams.get("date") 

    // Authentication check
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json(
            { error: 'Não autorizado' },
            { status: 401 }
        );
    }

    // Get userId from email
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) {
        return NextResponse.json(
            { error: 'Usuário não encontrado' },
            { status: 404 }
        );
    }

    // Return only the logged-in user's appointments
    const appointments = await prisma.appointment.findMany({
        where: {
            userId: user.id,  // Filter by user
            status: { not: "CANCELLED" }
        },
        include: {
            client: true,
            services: {  // ← NEW: Include multiple services
                include: {
                    service: true
                },
                orderBy: {
                    order: 'asc'
                }
            }
        },
        orderBy: {
            date: 'asc'
        }
    })

    return NextResponse.json(appointments)
}

/**
 * Check if a new appointment conflicts with existing ones
 * @param appointmentDate - Start date/time of new appointment
 * @param durationMinutes - Duration of the appointment
 * @param userId - User ID to filter appointments (only check conflicts for same user)
 * @param excludeId - Optional ID to exclude (when updating)
 * @returns Conflicting appointment if found, null otherwise
 */
async function checkAppointmentConflict(
    appointmentDate: Date,
    durationMinutes: number,
    userId: string,  // ← FIX: Added userId parameter
    excludeId?: string
) {
    const appointmentEnd = new Date(appointmentDate.getTime() + durationMinutes * 60000);

    // Get all non-cancelled appointments for this user only
    const existingAppointments = await prisma.appointment.findMany({
        where: {
            userId: userId,  // Filter by user
            status: { not: "CANCELLED" },
            ...(excludeId ? { id: { not: excludeId } } : {})
        },
        include: {
            services: {  // ← NEW: Include services for duration calculation
                include: {
                    service: true
                }
            },
            client: true
        }
    });

    // Check for time conflicts
    for (const existing of existingAppointments) {
        const existingStart = new Date(existing.date);
        // ← NEW: Use totalDurationMinutes, or calculate from services if needed
        const existingDuration = existing.totalDurationMinutes ||
            existing.services.reduce((sum, s) => sum + s.service.duration, 0) ||
            30; // fallback
        const existingEnd = new Date(existingStart.getTime() + existingDuration * 60000);

        // Check if appointments overlap
        const hasConflict = (
            // New appointment starts during existing one
            (appointmentDate >= existingStart && appointmentDate < existingEnd) ||
            // New appointment ends during existing one
            (appointmentEnd > existingStart && appointmentEnd <= existingEnd) ||
            // New appointment completely encompasses existing one
            (appointmentDate <= existingStart && appointmentEnd >= existingEnd)
        );

        if (hasConflict) {
            return existing;
        }
    }

    return null;
}

export async function POST(request: Request) {
    try {
        // Authentication check
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        // Get userId from email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { clientId, serviceId, serviceIds, date, durationMinutes } = body;

        // ← NEW: Backward compatibility - convert single serviceId to array  
        const finalServiceIds = serviceIds || (serviceId ? [serviceId] : []);

        // Basic validation
        if (!clientId || finalServiceIds.length === 0 || !date) {
            return NextResponse.json(
                { error: "Dados incompletos. Cliente, Serviço(s) e Data são obrigatórios." },
                { status: 400 }
            );
        }

        // ← NEW: Get ALL requested services
        const services = await prisma.service.findMany({
            where: { id: { in: finalServiceIds } }
        });

        if (services.length !== finalServiceIds.length) {
            return NextResponse.json(
                { error: "Um ou mais serviços não encontrados." },
                { status: 404 }
            );
        }

        // ← NEW: Calculate total duration from all services
        const finalDuration = durationMinutes ? Number(durationMinutes) :
            services.reduce((sum, s) => sum + s.duration, 0);
        const appointmentDate = new Date(date);

        // NEW: Check for day blocks
        const dateOnly = new Date(appointmentDate);
        dateOnly.setHours(0, 0, 0, 0);

        const blocks = await prisma.dayBlock.findMany({
            where: {
                AND: [
                    { startDate: { lte: dateOnly } },
                    { endDate: { gte: dateOnly } }
                ]
            }
        });

        // Check for blocking
        for (const block of blocks) {
            if (block.blockType === 'FULL_DAY') {
                return NextResponse.json(
                    { error: `Data bloqueada${block.reason ? ': ' + block.reason : ''}` },
                    { status: 400 }
                );
            }

            if (block.blockType === 'PARTIAL') {
                const apptHour = appointmentDate.getHours();
                const apptMin = appointmentDate.getMinutes();
                const apptMinutes = apptHour * 60 + apptMin;

                const [blockStartHour, blockStartMin] = block.startTime!.split(':').map(Number);
                const [blockEndHour, blockEndMin] = block.endTime!.split(':').map(Number);
                const blockStart = blockStartHour * 60 + blockStartMin;
                const blockEnd = blockEndHour * 60 + blockEndMin;

                if (apptMinutes >= blockStart && apptMinutes < blockEnd) {
                    return NextResponse.json(
                        { error: `Horário bloqueado${block.reason ? ': ' + block.reason : ''}` },
                        { status: 400 }
                    );
                }
            }
        }

        // CONFLICT VALIDATION: Check for scheduling conflicts (only with same user's appointments)
        const conflict = await checkAppointmentConflict(appointmentDate, finalDuration, user.id);  //← FIX: Pass userId

        if (conflict) {
            const conflictTime = new Date(conflict.date).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
            return NextResponse.json(
                {
                    error: `Conflito de horário detectado! Já existe um agendamento com ${conflict.client.name} às ${conflictTime}.`,
                    conflict: true
                },
                { status: 409 } // 409 Conflict HTTP status
            );
        }

        // ← NEW: Create appointment with multiple services
        const appointment = await prisma.appointment.create({
            data: {
                date: appointmentDate,
                totalDurationMinutes: finalDuration,  // ← NEW: Store total duration
                status: body.status || "PENDING",
                paymentMethod: body.paymentMethod || undefined,
                paidPrice: body.paidPrice ? Number(body.paidPrice) : undefined,
                client: { connect: { id: clientId } },
                user: { connect: { id: user.id } },
                services: {  // ← NEW: Create AppointmentService records
                    create: services.map((service, index) => ({
                        serviceId: service.id,
                        priceSnapshot: service.price,  // Capture price at time of booking
                        order: index + 1
                    }))
                }
            },
            include: {  // ← NEW: Include services in response
                services: {
                    include: {
                        service: true
                    }
                },
                client: true
            }
        });

        return NextResponse.json(appointment);
    } catch (error: any) {
        console.error("Failed to create appointment:", error);
        return NextResponse.json(
            { error: error.message || "Falha ao criar agendamento." },
            { status: 500 }
        );
    }
}
