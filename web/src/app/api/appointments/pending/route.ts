import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const today = new Date();
        const startToday = startOfDay(today);
        const endToday = endOfDay(today);

        // Find all appointments from today that don't have payment finalized
        const appointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: startToday,
                    lte: endToday
                },
                OR: [
                    { paidPrice: null },
                    { paymentMethod: null }
                ]
            },
            include: {
                client: {
                    select: {
                        name: true,
                        phone: true
                    }
                },
                service: {
                    select: {
                        name: true,
                        price: true
                    }
                }
            },
            orderBy: {
                date: "asc"
            }
        });

        // Convert Decimal to number for JSON serialization
        const serializedAppointments = appointments.map(apt => ({
            ...apt,
            service: {
                ...apt.service,
                price: apt.service.price.toNumber()
            }
        }));

        return NextResponse.json({
            appointments: serializedAppointments,
            count: appointments.length
        });
    } catch (error) {
        console.error("Error fetching pending appointments:", error);
        return NextResponse.json(
            { error: "Failed to fetch pending appointments" },
            { status: 500 }
        );
    }
}
