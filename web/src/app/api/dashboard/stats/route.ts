
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"

export async function GET() {
    // Use America/Sao_Paulo timezone for day boundaries
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const parts = formatter.formatToParts(now);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');

    // Create start and end dates in the Brazil timezone
    // 00:00:00 in Brazil is 03:00:00 UTC (assuming UTC-3)
    const start = new Date(Date.UTC(year, month, day, 3, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, day + 1, 2, 59, 59, 999));

    // 1. Count Appointments Today
    const count = await prisma.appointment.count({
        where: {
            date: {
                gte: start,
                lte: end
            },
            status: { not: "CANCELLED" }
        }
    })

    // 2. Sum Earnings Today
    const appointmentsToday = await prisma.appointment.findMany({
        where: {
            date: {
                gte: start,
                lte: end
            },
            status: { not: "CANCELLED" }
        },
        include: {
            services: {
                include: {
                    service: true
                }
            }
        },
        // We'll filter in JS to handle both PENDING (no payment method) and COMPLETED (with payment method)
    })

    // Fetch manual debt payments (incoming money without an appointment)
    const manualPaymentsToday = await prisma.walletHistory.findMany({
        where: {
            appointmentId: null, // Only manual entries
            amount: { gt: 0 },   // Only payments received
            createdAt: {
                gte: start,
                lte: end
            }
        },
        select: { amount: true }
    });

    const manualTotal = manualPaymentsToday.reduce((acc, p) => acc + Number(p.amount), 0);

    // Calculate earnings from all services using priceSnapshot, excluding Package Credits
    const earnings = appointmentsToday.reduce((acc: number, appt) => {
        // If it's a package credit session, it doesn't count as "earnings today"
        if (appt.paymentMethod === 'PACKAGE_CREDIT') return acc;

        // PRIORITIZE: Use paidPrice if it exists (real value charged)
        // FALLBACK: Use sum of service snapshots (estimated value)
        const apptTotal = appt.paidPrice 
            ? Number(appt.paidPrice) 
            : appt.services.reduce((sum: number, s) => sum + Number(s.priceSnapshot), 0);
            
        return acc + apptTotal;
    }, 0);

    const totalEarnings = earnings + manualTotal;

    // 3. Next Client
    // Find the first PENDING or CONFIRMED appointment after NOW (exclude COMPLETED)
    const nextAppointment = await prisma.appointment.findFirst({
        where: {
            date: {
                gte: new Date(), // Now
                lte: end // Until end of today
            },
            status: {
                in: ['PENDING', 'CONFIRMED']
            }
        },
        orderBy: {
            date: 'asc'
        },
        include: {
            client: true,
            services: {
                include: {
                    service: true
                }
            }
        }
    })

    return NextResponse.json({
        count,
        earnings: totalEarnings,
        nextClient: nextAppointment ? {
            name: nextAppointment.client.name,
            service: nextAppointment.services.map((s) => s.service.name).join(', '),
            time: nextAppointment.date
        } : null
    })
}
