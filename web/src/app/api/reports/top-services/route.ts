import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/reports/top-services?year=2025&metric=count
 * Returns TOP 5 services sorted by quantity (count) or revenue (revenue)
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

        // Parse parameters
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
        const metric = searchParams.get('metric') || 'count'; // 'count' or 'revenue'

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
            include: {
                services: {  // ← NEW: Include all services via junction table
                    include: {
                        service: true
                    }
                }
            }
        });

        // Group by service - now handling multiple services per appointment
        const serviceStats: { [key: string]: { id: string; name: string; count: number; revenue: number } } = {};

        appointments.forEach(appt => {
            // ← NEW: Iterate through all services in the appointment
            appt.services.forEach(appointmentService => {
                const serviceId = appointmentService.serviceId;
                if (!serviceStats[serviceId]) {
                    serviceStats[serviceId] = {
                        id: serviceId,
                        name: appointmentService.service.name,
                        count: 0,
                        revenue: 0
                    };
                }
                serviceStats[serviceId].count += 1;
                // ← FIX: Use priceSnapshot for accurate revenue (price at time of service)
                serviceStats[serviceId].revenue += Number(appointmentService.priceSnapshot || 0);
            });
        });

        // Convert to array and sort
        let servicesArray = Object.values(serviceStats);

        if (metric === 'revenue') {
            servicesArray.sort((a, b) => b.revenue - a.revenue);
        } else {
            servicesArray.sort((a, b) => b.count - a.count);
        }

        // Return top 5
        return NextResponse.json({
            metric,
            services: servicesArray.slice(0, 5)
        });

    } catch (error) {
        console.error('Error fetching top services:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar top serviços' },
            { status: 500 }
        );
    }
}
