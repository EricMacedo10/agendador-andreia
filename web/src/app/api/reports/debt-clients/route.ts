import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        // Fetch clients with negative balance (in debt)
        const debtClients = await prisma.client.findMany({
            where: {
                balance: { lt: 0 }
            },
            orderBy: {
                balance: 'asc' // Most negative first
            },
            select: {
                id: true,
                name: true,
                phone: true,
                balance: true,
                appointments: {
                    orderBy: { date: 'desc' },
                    take: 1,
                    select: { date: true }
                }
            }
        });

        const formattedClients = debtClients.map(client => ({
            id: client.id,
            name: client.name,
            phone: client.phone,
            debtAmount: Math.abs(Number(client.balance)),
            lastVisit: client.appointments[0]?.date ? client.appointments[0].date.toISOString() : null
        }));

        return NextResponse.json({ clients: formattedClients });

    } catch (error) {
        console.error('Error fetching debt clients:', error);
        return NextResponse.json({ error: 'Erro ao buscar clientes inadimplentes' }, { status: 500 });
    }
}
