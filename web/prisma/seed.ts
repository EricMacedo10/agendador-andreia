
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const andreia = await prisma.user.upsert({
        where: { email: 'admin@andreia.com' },
        update: {},
        create: {
            email: 'admin@andreia.com',
            name: 'Andreia',
            password: process.env.ADMIN_PASSWORD || 'insira-sua-senha-aqui', // Senha via variável de ambiente
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
