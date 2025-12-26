import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndCreateUsers() {
    try {
        // List all existing users
        const users = await prisma.user.findMany();

        console.log('📋 Usuários existentes no banco de PRODUÇÃO:');
        console.log('Total:', users.length);
        users.forEach(user => {
            console.log('- Email:', user.email, '| Role:', user.role, '| ID:', user.id);
        });
        console.log('');

        // Create Andreia's admin if doesn't exist
        const andreiaEmail = 'admin@deia.com';
        const existing = await prisma.user.findUnique({
            where: { email: andreiaEmail }
        });

        if (!existing) {
            const andreia = await prisma.user.create({
                data: {
                    name: 'Andreia',
                    email: andreiaEmail,
                    password: 'IsaManu@14',
                    role: 'ADMIN'
                }
            });
            console.log('✅ Admin Andreia criado em PRODUÇÃO!');
            console.log('Email:', andreia.email);
            console.log('Senha: IsaManu@14');
            console.log('ID:', andreia.id);
        } else {
            console.log('✅ Admin Andreia já existe!');
            console.log('Email:', existing.email);
            console.log('ID:', existing.id);
        }

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAndCreateUsers();
