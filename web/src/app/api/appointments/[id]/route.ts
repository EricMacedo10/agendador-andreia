import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Correctly type the params argument for dynamic routes in App Router
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { date, status, clientId, serviceId, durationMinutes } = body;

        const appointment = await prisma.appointment.update({
            where: { id },
            data: {
                date: date ? new Date(date) : undefined,
                status,
                clientId,
                serviceId,
                durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
                paymentMethod: body.paymentMethod,
                paidPrice: body.paidPrice ? Number(body.paidPrice) : undefined,
            },
        });

        return NextResponse.json(appointment);
    } catch (error: any) {
        console.error("Failed to update appointment:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update appointment" },
            { status: 500 }
        );
    }
}
