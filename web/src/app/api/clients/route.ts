import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { name: "asc" },
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
