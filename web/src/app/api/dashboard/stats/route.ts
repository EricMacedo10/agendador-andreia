
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
            service: true
        }
    })

    const earnings = appointmentsToday.reduce((acc, appt) => acc + Number(appt.service.price), 0)

    // 3. Next Client
    // Find the first appointment after NOW
    const nextAppointment = await prisma.appointment.findFirst({
        where: {
            date: {
                gte: new Date(), // Now
                lte: end // Until end of today (or remove this to check indefinitely)
            },
            status: { not: "CANCELLED" }
        },
        orderBy: {
            date: 'asc'
        },
        include: {
            client: true,
            service: true
        }
    })

    return NextResponse.json({
        count,
        earnings,
        nextClient: nextAppointment ? {
            name: nextAppointment.client.name,
            service: nextAppointment.service.name,
            time: nextAppointment.date
        } : null
    })
}
