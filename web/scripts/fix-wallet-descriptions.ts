/**
 * Script de limpeza: corrige nomenclatura antiga de movimentações de carteira
 * Executa com: npx ts-node scripts/fix-wallet-descriptions.ts
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Iniciando atualização de nomenclaturas...');

    // 1. "Saldo utilizado/Dívida" → "Dívida registrada (Pagar depois)"
    const debtFix = await prisma.walletHistory.updateMany({
        where: {
            description: { contains: 'Saldo utilizado/Dívida' },
            amount: { lt: 0 }
        },
        data: { description: 'Dívida registrada (Pagar depois)' }
    });

    console.log(`✅ Dívidas corrigidas: ${debtFix.count} registro(s)`);

    // 2. "Crédito (Agendamento #..." → "Crédito guardado (Agendamento)"
    const creditFix = await prisma.walletHistory.updateMany({
        where: {
            description: { startsWith: 'Crédito (Agendamento #' },
            amount: { gt: 0 }
        },
        data: { description: 'Crédito guardado (Agendamento)' }
    });

    console.log(`✅ Créditos corrigidos: ${creditFix.count} registro(s)`);

    console.log('🎉 Atualização concluída!');
}

main()
    .catch((e) => {
        console.error('❌ Erro:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
