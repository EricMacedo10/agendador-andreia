import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        // Check if admin already exists
        const existing = await prisma.user.findUnique({
            where: { email: 'admin@info.com' }
        });

        if (existing) {
            console.log('✅ Admin já existe!');
            console.log('Email:', existing.email);
            console.log('Role:', existing.role);
            return;
        }

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                name: 'Andreia',
                email: 'admin@info.com',
                password: 'Icabanu@14', // WARNING: In production, this should be hashed!
                role: 'ADMIN'
            }
        });

        console.log('✅ Admin criado com sucesso!');
        console.log('Email:', admin.email);
        console.log('Senha: Icabanu@14');
        console.log('Role:', admin.role);

    } catch (error) {
        console.error('❌ Erro ao criar admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
