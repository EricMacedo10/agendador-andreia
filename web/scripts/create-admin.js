/**
 * Script para criar usuário admin compartilhado
 * Uso: node create-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    // Configurações do usuário admin
    const email = 'admin@agendador-andreia.com';
    const password = 'Andreia@2024'; // Senha temporária - MUDAR DEPOIS!
    const name = 'Administrador';

    console.log('🔐 Criando usuário admin...');

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        console.log('⚠️  Usuário já existe. Atualizando senha...');

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                role: 'ADMIN',
                name
            }
        });

        console.log('✅ Senha atualizada!');
    } else {
        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Criar usuário
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'ADMIN'
            }
        });

        console.log('✅ Usuário admin criado com sucesso!');
        console.log('📧 Email:', email);
        console.log('🔑 Senha:', password);
    }

    console.log('\n⚠️  IMPORTANTE: Mude a senha após o primeiro login!');
    console.log('📱 Acesse: https://agendador-andreia.vercel.app\n');
}

main()
    .catch((e) => {
        console.error('❌ Erro:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
