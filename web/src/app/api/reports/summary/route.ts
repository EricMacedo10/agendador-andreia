import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export async function GET() {
    try {
        const now = new Date();

        // Ganhos do Dia
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);

        const todayData = await prisma.appointment.aggregate({
            where: {
                date: { gte: todayStart, lte: todayEnd },
                status: "COMPLETED"
            },
            _sum: { paidPrice: true },
            _count: true
        });

        // Ganhos do Mês
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        const monthData = await prisma.appointment.aggregate({
            where: {
                date: { gte: monthStart, lte: monthEnd },
                status: "COMPLETED"
            },
            _sum: { paidPrice: true },
            _count: true
        });

        // Ganhos do Ano
        const yearStart = startOfYear(now);
        const yearEnd = endOfYear(now);

        const yearData = await prisma.appointment.aggregate({
            where: {
                date: { gte: yearStart, lte: yearEnd },
                status: "COMPLETED"
            },
            _sum: { paidPrice: true },
            _count: true
        });

        return NextResponse.json({
            today: {
                revenue: Number(todayData._sum.paidPrice || 0),
                count: todayData._count
            },
            month: {
                revenue: Number(monthData._sum.paidPrice || 0),
                count: monthData._count
            },
            year: {
                revenue: Number(yearData._sum.paidPrice || 0),
                count: yearData._count
            }
        });
    } catch (error) {
        console.error("Error fetching reports summary:", error);
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}
