
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/user-helper";

export async function GET(
    request: Request,
    { params }: { params: any }
) {
    try {
        const { id } = await params;
        const client = await prisma.client.findUnique({
            where: { id },
            include: { appointments: true }
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        return NextResponse.json(client);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, phone } = body;

        await getAdminUser(); // Ensure auth context if needed later

        const client = await prisma.client.update({
            where: { id },
            data: {
                name,
                phone,
            }
        });

        return NextResponse.json(client);
    } catch (error) {
        console.error("Failed to update client", error);
        return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await getAdminUser();

        // First delete all appointments for this client
        await prisma.appointment.deleteMany({
            where: { clientId: id }
        });

        // Then delete the client
        await prisma.client.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete client", error);
        return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
    }
}
