import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { addMinutes } from 'date-fns';

export async function GET(request: Request) {
    try {
        // Verify authorization - accept via header OR query parameter
        const authHeader = request.headers.get('authorization');
        const url = new URL(request.url);
        const secretParam = url.searchParams.get('secret');

        const isValidHeader = authHeader === `Bearer ${process.env.CRON_SECRET}`;
        const isValidParam = secretParam === process.env.CRON_SECRET;

        if (!isValidHeader && !isValidParam) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const in10Minutes = addMinutes(now, 10);
        const in11Minutes = addMinutes(now, 11);

        // Find appointments starting in ~10 minutes that haven't been notified
        const appointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: in10Minutes,
                    lt: in11Minutes
                },
                status: {
                    in: ['PENDING', 'CONFIRMED']
                },
                notificationSent: false
            },
            include: {
                client: true,
                user: true,
                service: true
            }
        });

        let sentCount = 0;

        // Send notification for each appointment
        for (const appointment of appointments) {
            if (appointment.user.fcmToken) {
                try {
                    // Send notification
                    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            token: appointment.user.fcmToken,
                            title: '⏰ Atendimento em 10 minutos!',
                            body: `Olá, Andreia! A cliente ${appointment.client.name} irá chegar em 10 minutos.`,
                            data: {
                                appointmentId: appointment.id,
                                clientName: appointment.client.name
                            }
                        })
                    });

                    // Mark as notified
                    await prisma.appointment.update({
                        where: { id: appointment.id },
                        data: { notificationSent: true }
                    });

                    sentCount++;
                } catch (error) {
                    console.error(`Failed to send notification for appointment ${appointment.id}:`, error);
                }
            }
        }

        return NextResponse.json({
            success: true,
            checked: appointments.length,
            sent: sentCount
        });
    } catch (error) {
        console.error('Error in cron job:', error);
        return NextResponse.json(
            { error: 'Failed to check appointments' },
            { status: 500 }
        );
    }
}
