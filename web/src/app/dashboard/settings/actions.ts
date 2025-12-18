'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleBookingAvailability() {
    const settings = await prisma.businessSettings.findFirst()

    if (!settings) return;

    await prisma.businessSettings.update({
        where: { id: settings.id },
        data: {
            onlineBookingEnabled: !settings.onlineBookingEnabled
        }
    })

    revalidatePath('/dashboard/settings')
    revalidatePath('/book') // Update public page check
}

export async function saveScheduleSettings(schedule: any) {
    const settings = await prisma.businessSettings.findFirst()
    if (!settings) return;

    await prisma.businessSettings.update({
        where: { id: settings.id },
        data: {
            workingHours: schedule
        }
    })
    revalidatePath('/dashboard/settings')
    revalidatePath('/book')
}

export async function getSettings() {
    return await prisma.businessSettings.findFirst()
}
