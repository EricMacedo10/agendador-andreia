import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
    try {
        const now = new Date();

        // Find appointments for TODAY that are NOT completed or cancelled
        const pendingAppointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: startOfDay(now),
                    lte: endOfDay(now),
                },
                status: {
                    notIn: ["COMPLETED", "CANCELLED"]
                }
            },
            include: {
                client: true,
                service: true
            }
        });

        return NextResponse.json({
            count: pendingAppointments.length,
            appointments: pendingAppointments
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch reminders" },
            { status: 500 }
        );
    }
}
