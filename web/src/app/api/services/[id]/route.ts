import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Correctly type the params argument for dynamic routes in App Router
export async function PUT(
    request: Request,
    { params }: { params: any }
) {
    try {
        const id = (await params).id;
        const body = await request.json();
        const { name, price, duration, description, visible, imageUrl } = body;

        const service = await prisma.service.update({
            where: { id },
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
        return NextResponse.json(
            { error: "Failed to update service" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: any }
) {
    try {
        const id = (await params).id;
        await prisma.service.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to delete service" },
            { status: 500 }
        );
    }
}
