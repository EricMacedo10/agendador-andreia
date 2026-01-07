import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Verify user is authenticated and is ADMIN
        const session = await auth();

        // @ts-ignore
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Apenas administradores podem fazer backup' },
                { status: 403 }
            );
        }

        // Export all data from database
        const [users, clients, services, appointments, businessSettings] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    fcmToken: true,
                    createdAt: true,
                    updatedAt: true,
                    // Don't export password for security
                }
            }),
            prisma.client.findMany(),
            prisma.service.findMany(),
            prisma.appointment.findMany({
                include: {
                    client: true,
                    services: {
                        include: {
                            service: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.businessSettings.findMany()
        ]);

        const backup = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            exportedBy: session.user.email,
            data: {
                users,
                clients,
                services,
                appointments,
                businessSettings
            },
            stats: {
                totalUsers: users.length,
                totalClients: clients.length,
                totalServices: services.length,
                totalAppointments: appointments.length
            }
        };

        // Return as JSON download
        const filename = `backup-agendador-${new Date().toISOString().split('T')[0]}.json`;

        return new NextResponse(JSON.stringify(backup, null, 2), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('Backup error:', error);
        return NextResponse.json(
            { error: 'Erro ao gerar backup' },
            { status: 500 }
        );
    }
}
