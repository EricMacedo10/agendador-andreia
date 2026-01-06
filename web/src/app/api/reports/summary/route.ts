import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/reports/summary?year=2025
 * Returns financial summary for a specific year including:
 * - Total revenue and appointments
 * - Average ticket
 * - Monthly breakdown (all 12 months)
 * - Payment method breakdown
 */
export async function GET(request: Request) {
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

        // Parse year parameter
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

        // Fetch appointments for the year
        const appointments = await prisma.appointment.findMany({
            where: {
                userId: user.id,
                status: 'COMPLETED',
                date: {
                    gte: new Date(`${year}-01-01T00:00:00.000Z`),
                    lte: new Date(`${year}-12-31T23:59:59.999Z`)
                }
            },
            select: {
                date: true,
                paidPrice: true,
                paymentMethod: true
            }
        });

        // Calculate totals
        const totalRevenue = appointments.reduce((sum, a) => sum + Number(a.paidPrice || 0), 0);
        const totalAppointments = appointments.length;
        const averageTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

        // Monthly breakdown - initialize all 12 months
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        const monthlyData = monthNames.map((name, index) => ({
            month: index + 1,
            monthName: name,
            revenue: 0,
            appointments: 0
        }));

        // Fill in actual data
        appointments.forEach(appt => {
            const month = new Date(appt.date).getMonth(); // 0-indexed
            monthlyData[month].revenue += Number(appt.paidPrice || 0);
            monthlyData[month].appointments++;
        });

        // Payment method breakdown
        const paymentMethodMap = new Map<string, { count: number; total: number }>();

        appointments.forEach(appt => {
            if (!appt.paymentMethod) return;

            if (!paymentMethodMap.has(appt.paymentMethod)) {
                paymentMethodMap.set(appt.paymentMethod, { count: 0, total: 0 });
            }

            const data = paymentMethodMap.get(appt.paymentMethod)!;
            data.count++;
            data.total += Number(appt.paidPrice || 0);
        });

        const paymentMethodBreakdown = Array.from(paymentMethodMap.entries())
            .map(([method, data]) => ({
                method,
                count: data.count,
                total: data.total
            }))
            .sort((a, b) => b.total - a.total);

        return NextResponse.json({
            year,
            totalRevenue,
            totalAppointments,
            averageTicket,
            monthlyBreakdown: monthlyData,
            paymentMethodBreakdown
        });

    } catch (error) {
        console.error('Error fetching summary:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar resumo financeiro' },
            { status: 500 }
        );
    }
}
