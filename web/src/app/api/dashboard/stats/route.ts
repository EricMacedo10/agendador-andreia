
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"

export async function GET() {
    const today = new Date()
    const start = startOfDay(today)
    const end = endOfDay(today)

    // 1. Count Appointments Today
    const count = await prisma.appointment.count({
        where: {
            date: {
                gte: start,
                lte: end
            },
            status: { not: "CANCELLED" }
        }
    })

    // 2. Sum Earnings Today
    const appointmentsToday = await prisma.appointment.findMany({
        where: {
            date: {
                gte: start,
                lte: end
            },
            status: { not: "CANCELLED" }
        },
        include: {
            services: {
                include: {
                    service: true
                }
            }
        }
    })

    // Calculate earnings from all services using priceSnapshot
    const earnings = appointmentsToday.reduce((acc: number, appt) => {
        const apptTotal = appt.services.reduce((sum: number, s) => sum + Number(s.priceSnapshot), 0);
        return acc + apptTotal;
    }, 0);

    // 3. Next Client
    // Find the first PENDING or CONFIRMED appointment after NOW (exclude COMPLETED)
    const nextAppointment = await prisma.appointment.findFirst({
        where: {
            date: {
                gte: new Date(), // Now
                lte: end // Until end of today
            },
            status: {
                in: ['PENDING', 'CONFIRMED']
            }
        },
        orderBy: {
            date: 'asc'
        },
        include: {
            client: true,
            services: {
                include: {
                    service: true
                }
            }
        }
    })

    return NextResponse.json({
        count,
        earnings,
        nextClient: nextAppointment ? {
            name: nextAppointment.client.name,
            service: nextAppointment.services.map((s) => s.service.name).join(', '),
            time: nextAppointment.date
        } : null
    })
}
