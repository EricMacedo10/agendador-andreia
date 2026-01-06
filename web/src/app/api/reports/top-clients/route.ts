import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/reports/top-clients?year=2025&limit=10
 * Returns TOP clients ordered by total spent, including favorite service
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
        const limit = parseInt(searchParams.get('limit') || '10');

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
                client: true,
                services: {  // ← NEW: Include all services
                    include: {
                        service: true
                    }
                }
            }
        });

        // Group by client
        const clientStats: {
            [key: string]: {
                id: string;
                name: string;
                phone: string;
                visits: number;
                totalSpent: number;
                lastVisit: Date;
                services: { [key: string]: { name: string; count: number } };
            };
        } = {};

        appointments.forEach(appt => {
            const clientId = appt.clientId;
            if (!clientStats[clientId]) {
                clientStats[clientId] = {
                    id: clientId,
                    name: appt.client.name,
                    phone: appt.client.phone,
                    visits: 0,
                    totalSpent: 0,
                    lastVisit: appt.date,
                    services: {}
                };
            }

            const stats = clientStats[clientId];
            stats.visits += 1;
            stats.totalSpent += Number(appt.paidPrice || 0);

            // Track last visit
            if (appt.date > stats.lastVisit) {
                stats.lastVisit = appt.date;
            }

            // ← NEW: Track services for favorite calculation - iterate through all services
            appt.services.forEach(appointmentService => {
                const serviceId = appointmentService.serviceId;
                if (!stats.services[serviceId]) {
                    stats.services[serviceId] = {
                        name: appointmentService.service.name,
                        count: 0
                    };
                }
                stats.services[serviceId].count += 1;
            });
        });

        // Convert to array and calculate favorite service
        const clientsArray = Object.values(clientStats).map(client => {
            // Find most frequent service
            let favoriteService = 'N/A';
            let maxCount = 0;

            Object.values(client.services).forEach(service => {
                if (service.count > maxCount) {
                    maxCount = service.count;
                    favoriteService = service.name;
                }
            });

            return {
                id: client.id,
                name: client.name,
                phone: client.phone,
                totalAppointments: client.visits,
                totalSpent: client.totalSpent,
                averageTicket: client.visits > 0 ? client.totalSpent / client.visits : 0,
                lastVisit: client.lastVisit.toISOString(),
                favoriteService
            };
        });

        // Sort by total spent (descending) and limit
        clientsArray.sort((a, b) => b.totalSpent - a.totalSpent);

        return NextResponse.json({
            clients: clientsArray.slice(0, limit)
        });

    } catch (error) {
        console.error('Error fetching top clients:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar top clientes' },
            { status: 500 }
        );
    }
}
