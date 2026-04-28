import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/user-helper";

export async function GET() {
    try {
        await getAdminUser();
        const clients = await prisma.client.findMany({
            orderBy: { name: "asc" },
            include: { credits: { include: { service: true } } }
        });
        return NextResponse.json(clients);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch clients" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await getAdminUser();
        const body = await request.json();
        const { name, phone } = body;

        if (!name || !phone) {
            return NextResponse.json(
                { error: "Name and phone are required" },
                { status: 400 }
            );
        }

        const client = await prisma.client.create({
            data: { name, phone },
        });

        return NextResponse.json(client);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create client" },
            { status: 500 }
        );
    }
}
