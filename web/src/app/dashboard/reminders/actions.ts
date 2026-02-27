'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { startOfTomorrow, endOfTomorrow } from "date-fns"
import { auth } from "@/auth"

export async function getUpcomingReminders() {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")

    const start = startOfTomorrow()
    const end = endOfTomorrow()

    return await prisma.appointment.findMany({
        where: {
            date: {
                gte: start,
                lte: end
            },
            status: {
                in: ['PENDING', 'CONFIRMED']
            }
        },
        include: {
            client: true,
            services: {
                include: {
                    service: true
                }
            }
        },
        orderBy: {
            date: 'asc'
        }
    })
}

export async function markAsReminded(appointmentId: string) {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")

    await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
            whatsappReminderSent: true
        }
    })
    revalidatePath('/dashboard/reminders')
}
