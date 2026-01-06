
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

    // NEW: Check for day blocks
    const blocks = await prisma.dayBlock.findMany({
        where: {
            AND: [
                { startDate: { lte: date } },
                { endDate: { gte: date } }
            ]
        }
    });

    // If there's a FULL_DAY block, return empty array
    const hasFullDayBlock = blocks.some(b => b.blockType === 'FULL_DAY');
    if (hasFullDayBlock) {
        return NextResponse.json([]);
    }

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

    let slots = getAvailableSlots(date, workingHours, appointments, service.duration)

    // Filter slots that fall within PARTIAL blocks
    const partialBlocks = blocks.filter(b => b.blockType === 'PARTIAL');
    if (partialBlocks.length > 0) {
        slots = slots.filter(slot => {
            return !partialBlocks.some(block => {
                const [slotHour, slotMin] = slot.split(':').map(Number);
                const slotMinutes = slotHour * 60 + slotMin;

                const [blockStartHour, blockStartMin] = block.startTime!.split(':').map(Number);
                const [blockEndHour, blockEndMin] = block.endTime!.split(':').map(Number);
                const blockStart = blockStartHour * 60 + blockStartMin;
                const blockEnd = blockEndHour * 60 + blockEndMin;

                return slotMinutes >= blockStart && slotMinutes < blockEnd;
            });
        });
    }

    return NextResponse.json(slots)
}
