'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createAppointment(data: {
    serviceId: string,
    dateStr: string, // YYYY-MM-DD
    timeStr: string, // HH:mm
    clientName: string,
    clientPhone: string
}) {
    // 1. Find or Create Client
    let client = await prisma.client.findUnique({
        where: { phone: data.clientPhone }
    })

    if (!client) {
        client = await prisma.client.create({
            data: {
                name: data.clientName,
                phone: data.clientPhone
            }
        })
    }

    // 2. Parse Date/Time
    const dateTime = new Date(`${data.dateStr}T${data.timeStr}:00`) // Simplified ISO parse

    // 3. Get Default User (Andreia) - assuming single user system for now
    const user = await prisma.user.findFirst()
    if (!user) throw new Error("System configuration error: No provider found.")

    // 4. Create Appointment
    const service = await prisma.service.findUnique({
        where: { id: data.serviceId }
    })

    if (!service) throw new Error("Service not found")

    const appointment = await prisma.appointment.create({
        data: {
            date: dateTime,
            status: "CONFIRMED",
            clientId: client.id,
            userId: user.id,
            totalDurationMinutes: service.duration,
            services: {
                create: [{
                    serviceId: service.id,
                    priceSnapshot: service.price,
                    order: 1
                }]
            }
        }
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/schedule')

    return appointment
}
