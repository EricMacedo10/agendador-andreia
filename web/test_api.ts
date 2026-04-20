import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const year = 2026;
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const manualPayments = await prisma.walletHistory.findMany({
        where: {
            amount: { gt: 0 },
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        },
        select: {
            amount: true,
            createdAt: true,
            description: true,
            clientId: true
        }
    });

    console.log(`Found ${manualPayments.length} manual payments for year ${year}`);
    manualPayments.forEach(p => {
        console.log(`${p.createdAt.toISOString()} | Amount: ${p.amount} | Desc: ${p.description}`);
    });

    const manualRevenue = manualPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    console.log(`Manual Revenue: ${manualRevenue}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
