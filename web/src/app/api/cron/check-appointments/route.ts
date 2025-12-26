import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { addMinutes } from 'date-fns';
import { rateLimit } from '@/lib/rate-limit';

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

        // 🔒 SEGURANÇA: Rate limiting (máximo 15 requisições por hora)
        // Protege contra spam mesmo com secret válido
        const limiter = await rateLimit({
            key: 'cron-check-appointments',
            limit: 15,
            window: 3600000 // 1 hora
        });

        if (!limiter.success) {
            return NextResponse.json({
                error: 'Rate limit exceeded. Cron is being called too frequently.'
            }, { status: 429 });
        }

        const now = new Date();
        const in8Minutes = addMinutes(now, 8);
        const in15Minutes = addMinutes(now, 15);

        // Find appointments starting in 8-15 minutes that haven't been notified
        // Wider window to account for cron execution delays
        const appointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: in8Minutes,
                    lt: in15Minutes
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

        let markedCount = 0;

        // Mark appointments as needing notification (in-app system)
        for (const appointment of appointments) {
            try {
                // Simply mark as notified - dashboard will show via reminders
                await prisma.appointment.update({
                    where: { id: appointment.id },
                    data: { notificationSent: true }
                });

                markedCount++;
            } catch (error) {
                console.error(`Failed to mark appointment ${appointment.id}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            checked: appointments.length,
            marked: markedCount,
            debug: {
                appointmentsFound: appointments.length,
                timeWindow: `${in8Minutes.toISOString()} - ${in15Minutes.toISOString()}`
            }
        });
    } catch (error) {
        console.error('Error in cron job:', error);
        return NextResponse.json(
            { error: 'Failed to check appointments' },
            { status: 500 }
        );
    }
}
