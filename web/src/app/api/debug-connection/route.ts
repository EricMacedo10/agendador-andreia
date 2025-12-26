import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await auth();

        // Mask the database URL for security, but show the host
        const dbUrl = process.env.DATABASE_URL || 'NOT_DEFINED';
        const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':***@'); // Hide password

        // Get all users in the CURRENTLY CONNECTED database
        const usersInDb = await prisma.user.findMany({
            select: { id: true, email: true, role: true }
        });

        const debugInfo = {
            environment: {
                maskedUrl,
                nodeEnv: process.env.NODE_ENV,
            },
            session: {
                exists: !!session,
                user: session?.user || null,
            },
            database: {
                userCount: usersInDb.length,
                usersFound: usersInDb,
                // Check if session user exists in this DB
                sessionUserExists: session?.user?.email
                    ? usersInDb.some(u => u.email === session.user?.email)
                    : false
            }
        };

        return NextResponse.json(debugInfo, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            error: 'Debug failed',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
