import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        // Verify user is authenticated and is ADMIN
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            );
        }

        // Check if user is ADMIN
        const user = await prisma.user.findUnique({
            where: { email: session.user.email || undefined }
        });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Apenas administradores podem restaurar backup' },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Validate backup format
        if (!body.version || !body.data) {
            return NextResponse.json(
                { error: 'Formato de backup inválido' },
                { status: 400 }
            );
        }

        const { data } = body;

        // CRITICAL: Delete all existing data first (in correct order due to foreign keys)
        await prisma.$transaction(async (tx) => {
            // Delete in order: children first, then parents
            await tx.appointment.deleteMany();
            await tx.client.deleteMany();
            await tx.service.deleteMany();
            await tx.businessSettings.deleteMany();
            // Keep current users to maintain authentication

            // Restore data
            if (data.clients?.length > 0) {
                await tx.client.createMany({ data: data.clients });
            }

            if (data.services?.length > 0) {
                await tx.service.createMany({ data: data.services });
            }

            if (data.appointments?.length > 0) {
                // Appointments need special handling due to relations
                for (const appointment of data.appointments) {
                    await tx.appointment.create({
                        data: {
                            id: appointment.id,
                            date: new Date(appointment.date),
                            durationMinutes: appointment.durationMinutes,
                            status: appointment.status,
                            userId: appointment.userId,
                            clientId: appointment.clientId,
                            serviceId: appointment.serviceId,
                            notificationSent: appointment.notificationSent,
                            paymentMethod: appointment.paymentMethod,
                            paidPrice: appointment.paidPrice,
                            createdAt: new Date(appointment.createdAt),
                            updatedAt: new Date(appointment.updatedAt)
                        }
                    });
                }
            }

            if (data.businessSettings?.length > 0) {
                await tx.businessSettings.createMany({ data: data.businessSettings });
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Backup restaurado com sucesso',
            restored: {
                clients: data.clients?.length || 0,
                services: data.services?.length || 0,
                appointments: data.appointments?.length || 0,
                businessSettings: data.businessSettings?.length || 0
            }
        });

    } catch (error) {
        console.error('Restore error:', error);
        return NextResponse.json(
            { error: 'Erro ao restaurar backup', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
