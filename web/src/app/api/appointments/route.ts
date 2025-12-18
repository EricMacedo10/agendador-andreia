
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

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

        const appointment = await prisma.appointment.create({
            data: {
                date: new Date(date),
                durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
                status: body.status || "PENDING",
                paymentMethod: body.paymentMethod || undefined,
                paidPrice: body.paidPrice ? Number(body.paidPrice) : undefined,
                client: { connect: { id: clientId } },
                service: { connect: { id: serviceId } },
                // Fallback to first user if admin doesn't exist, or just use admin
                user: { connect: { email: "admin@andreia.com" } }
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
