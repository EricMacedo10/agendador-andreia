import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/reports/years
 * Returns all years that have completed appointments with revenue data
 */
export async function GET() {
    try {
        // Authentication check
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        // Get userId from email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        // Fetch all completed appointments
        const appointments = await prisma.appointment.findMany({
            where: {
                userId: user.id,
                status: 'COMPLETED'
            },
            select: {
                date: true,
                paidPrice: true
            }
        });

        // Group by year
        const yearMap = new Map<number, { count: number; revenue: number }>();

        appointments.forEach(appt => {
            const year = new Date(appt.date).getFullYear();

            if (!yearMap.has(year)) {
                yearMap.set(year, { count: 0, revenue: 0 });
            }

            const data = yearMap.get(year)!;
            data.count++;
            data.revenue += Number(appt.paidPrice || 0);
        });

        // Convert to array and sort (most recent first)
        const years = Array.from(yearMap.entries())
            .map(([year, data]) => ({
                year,
                appointmentCount: data.count,
                totalRevenue: data.revenue
            }))
            .sort((a, b) => b.year - a.year);

        return NextResponse.json({ years });

    } catch (error) {
        console.error('Error fetching report years:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar anos disponíveis' },
            { status: 500 }
        );
    }
}
