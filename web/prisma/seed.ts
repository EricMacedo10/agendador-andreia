
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const andreia = await prisma.user.upsert({
        where: { email: 'admin@andreia.com' },
        update: {},
        create: {
            email: 'admin@andreia.com',
            name: 'Andreia',
            // Hash password even in seed
            // Note: Since we can't easily import bcrypt here if it's not a module, rely on environment or pre-hashed
            // For simplicity in this specific seed file, let's assume we want to set it properly.
            // However, prisma seed runs in TS node. We can use bcrypt.
            password: process.env.ADMIN_PASSWORD ?
                await require('bcryptjs').hash(process.env.ADMIN_PASSWORD, 10) :
                await require('bcryptjs').hash('admin123', 10), // Default local dev password hashed
        },
    })

    // Ensure Business Settings exist
    const settings = await prisma.businessSettings.findFirst()
    if (!settings) {
        await prisma.businessSettings.create({
            data: {
                onlineBookingEnabled: true
            }
        })
    }

    console.log({ andreia })
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
