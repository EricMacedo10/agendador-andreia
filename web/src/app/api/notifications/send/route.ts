import { NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
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

        const response = await adminMessaging.send(message);

        return NextResponse.json({
            success: true,
            messageId: response
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}
