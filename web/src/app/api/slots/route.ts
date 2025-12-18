
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getAvailableSlots, WorkingHours, DEFAULT_WORKING_HOURS } from "@/lib/availability"
import { parseISO } from "date-fns"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get("date") // yyyy-MM-dd
    const serviceId = searchParams.get("serviceId")

    if (!dateStr || !serviceId) {
        return NextResponse.json({ error: "Missing date or serviceId" }, { status: 400 })
    }

    const date = parseISO(dateStr)
    const service = await prisma.service.findUnique({ where: { id: serviceId } })

    if (!service) {
        return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Fetch settings for working hours
    const settings = await prisma.businessSettings.findFirst()
    const workingHours = (settings?.workingHours as WorkingHours) || DEFAULT_WORKING_HOURS

    // Fetch existing appointments for the date
    // We need to fetch range to cover potential overlaps, usually start of day to end of day is enough for single day view
    // optimize later to fetch broader range if needed

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const appointments = await prisma.appointment.findMany({
        where: {
            date: {
                gte: startOfDay,
                lte: endOfDay
            },
            status: { not: "CANCELLED" }
        },
        include: {
            service: true // we need duration
        }
    })

    const slots = getAvailableSlots(date, workingHours, appointments, service.duration)

    return NextResponse.json(slots)
}
