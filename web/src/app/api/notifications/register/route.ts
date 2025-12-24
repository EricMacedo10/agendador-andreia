import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // Save FCM token to user
        await prisma.user.update({
            where: { email: session.user.email! },
            data: { fcmToken: token }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error registering FCM token:', error);
        return NextResponse.json({ error: 'Failed to register token' }, { status: 500 });
    }
}
