
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const settings = await prisma.businessSettings.findFirst()
    console.log('Current Settings:', settings)

    if (settings && !settings.onlineBookingEnabled) {
        console.log('Enabling booking...')
        const updated = await prisma.businessSettings.update({
            where: { id: settings.id },
            data: { onlineBookingEnabled: true }
        })
        console.log('Updated Settings:', updated)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
