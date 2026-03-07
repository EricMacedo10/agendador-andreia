'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function getUpcomingReminders() {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")

    // Compensa o fuso horário (Vercel roda em UTC, Brasil é UTC-3)
    const nowInBrazil = new Date(Date.now() - 3 * 60 * 60 * 1000)

    // Adiciona 1 dia para pegar o "Amanhã" real do Brasil
    nowInBrazil.setUTCDate(nowInBrazil.getUTCDate() + 1)

    const yyyy = nowInBrazil.getUTCFullYear()
    const mm = String(nowInBrazil.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(nowInBrazil.getUTCDate()).padStart(2, '0')

    // Como os cadastramentos geram datas interpretadas localmente pelo servidor
    // na Vercel o váriavel start será "YYYY-MM-DDT00:00:00.000Z"
    const start = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`)
    const end = new Date(`${yyyy}-${mm}-${dd}T23:59:59.999Z`)

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
