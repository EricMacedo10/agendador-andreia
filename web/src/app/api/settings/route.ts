import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        let settings = await prisma.businessSettings.findFirst();

        if (!settings) {
            settings = await prisma.businessSettings.create({
                data: {
                    onlineBookingEnabled: false,
                },
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { onlineBookingEnabled } = body;

        let settings = await prisma.businessSettings.findFirst();

        if (settings) {
            settings = await prisma.businessSettings.update({
                where: { id: settings.id },
                data: { onlineBookingEnabled },
            });
        } else {
            settings = await prisma.businessSettings.create({
                data: { onlineBookingEnabled },
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        );
    }
}
