
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
            password: (() => {
                if (!process.env.ADMIN_PASSWORD) {
                    throw new Error('❌ ERRO CRÍTICO: Variável de ambiente ADMIN_PASSWORD não configurada no seed.');
                }
                // Use require here because bcryptjs might not be available in all environments where seed runs
                const bcrypt = require('bcryptjs');
                return bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
            })(),
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
