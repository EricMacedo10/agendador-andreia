import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// Helper function to get user ID and role from session
async function getUserIdFromEmail(email: string | null | undefined): Promise<{ id: string, role: string }> {
    if (!email) {
        throw new Error("Email not found in session");
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, role: true }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

// GET /api/blocks - List blocks
export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Não autenticado" },
                { status: 401 }
            );
        }

        const user = await getUserIdFromEmail(session.user.email);
        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        const where: any = {
            ...(user.role !== 'ADMIN' ? { createdBy: user.id } : {})
        };

        if (start) {
            where.startDate = { gte: new Date(start) };
        }

        if (end) {
            where.endDate = { lte: new Date(end) };
        }

        const blocks = await prisma.dayBlock.findMany({
            where,
            orderBy: { startDate: 'asc' }
        });

        return NextResponse.json(blocks);
    } catch (error: any) {
        console.error("Failed to fetch blocks:", error);
        return NextResponse.json(
            { error: error.message || "Falha ao buscar bloqueios" },
            { status: 500 }
        );
    }
}

// POST /api/blocks - Create block
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Não autenticado" },
                { status: 401 }
            );
        }

        const user = await getUserIdFromEmail(session.user.email);
        const body = await request.json();
        const { startDate, endDate, blockType, startTime, endTime, reason } = body;

        // Validations
        if (!startDate || !endDate || !blockType) {
            return NextResponse.json(
                { error: "Dados incompletos. Data início, data fim e tipo são obrigatórios." },
                { status: 400 }
            );
        }

        // Parse dates correctly without timezone offset
        // Input format is YYYY-MM-DD, we need to treat as local date
        const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
        const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

        const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
        const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

        console.log('📅 Date parsing:', {
            input: { startDate, endDate },
            parsed: { start: start.toISOString(), end: end.toISOString() }
        });

        // Validate dates
        if (start > end) {
            return NextResponse.json(
                { error: "Data de início deve ser anterior ou igual à data de fim." },
                { status: 400 }
            );
        }

        // Validate past dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (start < today) {
            return NextResponse.json(
                { error: "Não é possível bloquear datas no passado." },
                { status: 400 }
            );
        }

        // Validate partial blocks
        if (blockType === 'PARTIAL') {
            if (!startTime || !endTime) {
                return NextResponse.json(
                    { error: "Horário de início e fim são obrigatórios para bloqueios parciais." },
                    { status: 400 }
                );
            }

            // Validate time format and order
            const [startHour, startMin] = startTime.split(':').map(Number);
            const [endHour, endMin] = endTime.split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;

            if (startMinutes >= endMinutes) {
                return NextResponse.json(
                    { error: "Horário de início deve ser anterior ao horário de fim." },
                    { status: 400 }
                );
            }
        }

        // Check for conflicting appointments (optional force parameter)
        const force = new URL(request.url).searchParams.get('force') === 'true';

        if (!force) {
            // Use UTC midnight strings — same format as what is stored in the DB
            // This prevents the UTC-3 timezone shift that was returning conflicts
            // from the NEXT day instead of the selected day
            const conflictStart = new Date(startDate + 'T00:00:00.000Z');
            const conflictEnd   = new Date(endDate   + 'T23:59:59.999Z');

            const conflicts = await checkAppointmentConflicts(
                user.id,
                conflictStart,
                conflictEnd,
                blockType,
                startTime,
                endTime
            );

            if (conflicts.length > 0) {
                return NextResponse.json({
                    warning: true,
                    conflicts: conflicts.map(appt => ({
                        date: appt.date.toISOString().split('T')[0],
                        time: appt.date.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'America/Sao_Paulo'
                        }),
                        clientName: appt.client.name
                    }))
                }, { status: 200 });
            }
        }


        // Convert date strings to UTC Date objects at midnight
        // This ensures consistent storage regardless of server timezone
        const startDateObj = new Date(startDate + 'T00:00:00.000Z');
        const endDateObj = new Date(endDate + 'T00:00:00.000Z');

        console.log('💾 Saving to database:', {
            startDate: startDateObj.toISOString(),
            endDate: endDateObj.toISOString()
        });

        // Create block
        const block = await prisma.dayBlock.create({
            data: {
                startDate: startDateObj,
                endDate: endDateObj,
                blockType,
                startTime: blockType === 'PARTIAL' ? startTime : null,
                endTime: blockType === 'PARTIAL' ? endTime : null,
                reason,
                createdBy: user.id
            }
        });

        return NextResponse.json(block);
    } catch (error: any) {
        console.error("Failed to create block:", error);
        return NextResponse.json(
            { error: error.message || "Falha ao criar bloqueio" },
            { status: 500 }
        );
    }
}

// Helper function to check appointment conflicts
async function checkAppointmentConflicts(
    userId: string,
    startDate: Date,
    endDate: Date,
    blockType: string,
    startTime?: string,
    endTime?: string
) {
    const appointments = await prisma.appointment.findMany({
        where: {
            userId,
            status: { not: "CANCELLED" },
            date: {
                gte: startDate,
                lte: endDate
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

    if (blockType === 'FULL_DAY') {
        return appointments;
    }

    // For PARTIAL blocks, filter by time
    const [blockStartHour, blockStartMin] = startTime!.split(':').map(Number);
    const [blockEndHour, blockEndMin] = endTime!.split(':').map(Number);
    const blockStartMinutes = blockStartHour * 60 + blockStartMin;
    const blockEndMinutes = blockEndHour * 60 + blockEndMin;

    return appointments.filter(appt => {
        const apptDate = new Date(appt.date);
        const apptHour = apptDate.getHours();
        const apptMin = apptDate.getMinutes();
        const apptMinutes = apptHour * 60 + apptMin;

        // Check if appointment falls within blocked time
        return apptMinutes >= blockStartMinutes && apptMinutes < blockEndMinutes;
    });
}
