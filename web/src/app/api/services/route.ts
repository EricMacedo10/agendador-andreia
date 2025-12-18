import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const onlyVisible = searchParams.get("public") === "true";

        const where = onlyVisible ? { visible: true } : {};

        const services = await prisma.service.findMany({
            where,
            orderBy: { name: "asc" },
        });

        return NextResponse.json(services);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch services" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, price, duration, description, visible, imageUrl } = body;

        const service = await prisma.service.create({
            data: {
                name,
                price,
                duration: Number(duration),
                description,
                visible,
                imageUrl,
            },
        });

        return NextResponse.json(service);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to create service" },
            { status: 500 }
        );
    }
}
