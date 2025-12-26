import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
// TEMPORARY: Comentado para deployment - Vercel cache issue
// import { adminMessaging } from '@/lib/firebase-admin';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        // 🔒 SEGURANÇA: Verificar autenticação
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 🔒 SEGURANÇA: Rate limiting (5 notificações por minuto por usuário)
        const limiter = await rateLimit({
            key: `notif-send-${session.user.email}`,
            limit: 5,
            window: 60000 // 1 minuto
        });

        if (!limiter.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait before sending more notifications.' },
                { status: 429 }
            );
        }

        const { token, title, body, data } = await request.json();

        if (!token || !title || !body) {
            return NextResponse.json(
                { error: 'Token, title and body are required' },
                { status: 400 }
            );
        }

        const message = {
            notification: {
                title,
                body
            },
            data: data || {},
            token
        };

        // TEMPORARY: Firebase notifications disabled during deployment fix
        // const response = await adminMessaging.send(message);

        return NextResponse.json({
            success: true,
            message: 'Notification endpoint temporarily disabled'
            // messageId: response
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}
