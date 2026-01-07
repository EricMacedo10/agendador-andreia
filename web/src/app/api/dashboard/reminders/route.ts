import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
    const startTime = Date.now();

    // DIAGNOSTIC: Log function entry
    console.log('[REMINDERS_API_START]', {
        timestamp: new Date().toISOString(),
        region: process.env.VERCEL_REGION,
    });

    try {
        const now = new Date();

        // DIAGNOSTIC: Log before Prisma query
        const beforeQuery = Date.now();
        console.log('[REMINDERS_API_BEFORE_QUERY]', {
            timeSinceStart: `${beforeQuery - startTime}ms`,
            timestamp: new Date().toISOString(),
        });

        // Find appointments for TODAY that are NOT completed or cancelled
        const pendingAppointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: startOfDay(now),
                    lte: endOfDay(now),
                },
                status: {
                    notIn: ["COMPLETED", "CANCELLED"]
                }
            },
            include: {
                client: true,
                services: {
                    include: {
                        service: true
                    }
                }
            }
        });

        // DIAGNOSTIC: Log after Prisma query
        const afterQuery = Date.now();
        console.log('[REMINDERS_API_AFTER_QUERY]', {
            queryTime: `${afterQuery - beforeQuery}ms`,
            totalTime: `${afterQuery - startTime}ms`,
            resultCount: pendingAppointments.length,
            timestamp: new Date().toISOString(),
        });

        const executionTime = Date.now() - startTime;

        // Log successful execution for monitoring
        console.log('[REMINDERS_API_SUCCESS]', {
            count: pendingAppointments.length,
            executionTime: `${executionTime}ms`,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json({
            count: pendingAppointments.length,
            appointments: pendingAppointments
        });
    } catch (error) {
        const executionTime = Date.now() - startTime;

        // Detailed error logging for diagnosis
        console.error('[REMINDERS_API_ERROR]', {
            error: {
                message: error instanceof Error ? error.message : 'Unknown error',
                name: error instanceof Error ? error.name : 'UnknownError',
                stack: error instanceof Error ? error.stack : undefined,
            },
            timing: {
                executionTime: `${executionTime}ms`,
                timestamp: new Date().toISOString(),
            },
            prisma: {
                // Check if it's a Prisma-specific error
                isPrismaError: error?.constructor?.name?.includes('Prisma'),
                code: (error as any)?.code,
                meta: (error as any)?.meta,
            },
            environment: {
                nodeEnv: process.env.NODE_ENV,
                region: process.env.VERCEL_REGION,
            }
        });

        return NextResponse.json(
            { error: "Failed to fetch reminders" },
            { status: 500 }
        );
    }
}

