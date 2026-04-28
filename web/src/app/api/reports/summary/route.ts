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

        // Get userId and role from email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, role: true }
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

        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

        const appointments = await prisma.appointment.findMany({
            where: {
                ...(user.role !== 'ADMIN' ? { userId: user.id } : {}),
                status: 'COMPLETED',
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                date: true,
                paidPrice: true,
                paymentMethod: true
            }
        });

        // Fetch manual payments (debt payments/manual credits) from WalletHistory
        // We only count positive adjustments that are NOT linked to an appointment 
        // OR are specifically debt payments which are already handled via appointmentId: null in the modal
        const manualPayments = await prisma.walletHistory.findMany({
            where: {
                clientId: {
                    in: await prisma.client.findMany({
                        select: { id: true }
                    }).then(clients => clients.map(c => c.id))
                },
                amount: { gt: 0 },
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                amount: true,
                createdAt: true,
                description: true
            }
        });

        // Calculate totals
        const appointmentRevenue = appointments.reduce((sum, a) => sum + Number(a.paidPrice || 0), 0);
        const manualRevenue = manualPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        
        const totalRevenue = appointmentRevenue + manualRevenue;
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

        // Fill in appointment data
        appointments.forEach(appt => {
            const month = new Date(appt.date).getMonth(); // 0-indexed
            monthlyData[month].revenue += Number(appt.paidPrice || 0);
            monthlyData[month].appointments++;
        });

        // Fill in manual payments data
        manualPayments.forEach(payment => {
            const month = new Date(payment.createdAt).getMonth();
            monthlyData[month].revenue += Number(payment.amount || 0);
        });

        // Payment method breakdown
        const paymentMethodMap = new Map<string, { count: number; total: number }>();

        // From appointments
        appointments.forEach(appt => {
            if (!appt.paymentMethod) return;

            if (!paymentMethodMap.has(appt.paymentMethod)) {
                paymentMethodMap.set(appt.paymentMethod, { count: 0, total: 0 });
            }

            const data = paymentMethodMap.get(appt.paymentMethod)!;
            data.count++;
            data.total += Number(appt.paidPrice || 0);
        });

        // From manual payments (deduce method from description if possible, else 'OUTROS')
        manualPayments.forEach(p => {
            let method = 'OTHER';
            if (p.description.includes('PIX')) method = 'PIX';
            else if (p.description.includes('Dinheiro')) method = 'CASH';
            else if (p.description.includes('Cartão')) method = 'CREDIT_CARD';

            if (!paymentMethodMap.has(method)) {
                paymentMethodMap.set(method, { count: 0, total: 0 });
            }

            const data = paymentMethodMap.get(method)!;
            data.count++;
            data.total += Number(p.amount || 0);
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
