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
        const { date, status, clientId } = body;  // ← REMOVED: serviceId, durationMinutes (no longer exist)

        const appointment = await prisma.appointment.update({
            where: { id },
            data: {
                date: date ? new Date(date) : undefined,
                status,
                clientId,
                // ← NOTE: Services are NOT updated via PUT - use dedicated endpoints for that
                paymentMethod: body.paymentMethod,
                paidPrice: body.paidPrice ? Number(body.paidPrice) : undefined,
            },
            include: {  // ← Include services in response
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
        console.error("Failed to update appointment:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update appointment" },
            { status: 500 }
        );
    }
}
