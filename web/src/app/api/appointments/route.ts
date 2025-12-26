
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    // Optional: filter by date if needed for optimization
    // const date = searchParams.get("date") 

    // For now returning all, as per MVP request. 
    // Optimization: Add date range filter (start/end)
    const appointments = await prisma.appointment.findMany({
        where: {
            status: { not: "CANCELLED" }
        },
        include: {
            client: true,
            service: true
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
 * @param excludeId - Optional ID to exclude (when updating)
 * @returns Conflicting appointment if found, null otherwise
 */
async function checkAppointmentConflict(
    appointmentDate: Date,
    durationMinutes: number,
    excludeId?: string
) {
    const appointmentEnd = new Date(appointmentDate.getTime() + durationMinutes * 60000);

    // Get all non-cancelled appointments
    const existingAppointments = await prisma.appointment.findMany({
        where: {
            status: { not: "CANCELLED" },
            ...(excludeId ? { id: { not: excludeId } } : {})
        },
        include: {
            service: true,
            client: true
        }
    });

    // Check for time conflicts
    for (const existing of existingAppointments) {
        const existingStart = new Date(existing.date);
        const existingDuration = existing.durationMinutes || existing.service.duration;
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
        const body = await request.json();
        const { clientId, serviceId, date, durationMinutes } = body;

        // Basic validation
        if (!clientId || !serviceId || !date) {
            return NextResponse.json(
                { error: "Dados incompletos. Cliente, Serviço e Data são obrigatórios." },
                { status: 400 }
            );
        }

        // Get service to determine duration if not provided
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });

        if (!service) {
            return NextResponse.json(
                { error: "Serviço não encontrado." },
                { status: 404 }
            );
        }

        const finalDuration = durationMinutes ? Number(durationMinutes) : service.duration;
        const appointmentDate = new Date(date);

        // CONFLICT VALIDATION: Check for scheduling conflicts
        const conflict = await checkAppointmentConflict(appointmentDate, finalDuration);

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

        // Create appointment with session user
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Usuário não autenticado." },
                { status: 401 }
            );
        }

        const appointment = await prisma.appointment.create({
            data: {
                date: appointmentDate,
                durationMinutes: finalDuration,
                status: body.status || "PENDING",
                paymentMethod: body.paymentMethod || undefined,
                paidPrice: body.paidPrice ? Number(body.paidPrice) : undefined,
                client: { connect: { id: clientId } },
                service: { connect: { id: serviceId } },
                user: { connect: { email: session.user.email } }
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
