/**
 * Script simples para criar usuário admin (SEM bcrypt)
 * Uso: node create-simple-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'admin@agendador.com';
    const password = 'Andreia2024!';  // Senha compartilhada
    const name = 'Admin';

    console.log('🔐 Criando usuário admin...\n');

    // Deletar usuário existente se houver
    await prisma.user.deleteMany({
        where: { email }
    });

    // Criar novo usuário
    const user = await prisma.user.create({
        data: {
            email,
            password,  // Texto puro (auth.ts não usa bcrypt ainda)
            name,
            role: 'ADMIN'
        }
    });

    console.log('✅ Usuário admin criado com SUCESSO!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:  ', email);
    console.log('🔑 Senha:  ', password);
    console.log('═══════════════════════════════════════\n');
    console.log('🌐 Login: https://agendador-andreia.vercel.app\n');
    console.log('💡 COMPARTILHEM estas credenciais entre vocês!\n');
}

main()
    .catch((e) => {
        console.error('❌ Erro:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
