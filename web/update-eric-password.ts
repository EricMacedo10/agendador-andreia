
import { PrismaClient } from '@prisma/client'
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@eric.com';
    const newPassword = 'IsaManu@14';
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    const updatedUser = await prisma.user.upsert({
        where: { email: email },
        update: {
            password: hashedPassword,
            role: 'ADMIN'
        },
        create: {
            email: email,
            name: 'Eric Adm',
            password: hashedPassword,
            role: 'ADMIN'
        }
    });

    console.log(`✅ Sucesso! Senha e cargo ADMIN configurados para: ${email}`);
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
