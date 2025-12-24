import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameMonth } from "date-fns";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
        const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

        // Criar datas de início e fim do mês selecionado
        const selectedDate = new Date(year, month - 1, 1); // month-1 porque Date usa 0-11
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);

        // Ganhos do Dia (apenas se for o mês atual)
        const today = new Date();
        const isCurrentMonth = isSameMonth(today, selectedDate);

        let todayData = { _sum: { paidPrice: null }, _count: 0 };
        if (isCurrentMonth) {
            const todayStart = startOfDay(today);
            const todayEnd = endOfDay(today);

            todayData = await prisma.appointment.aggregate({
                where: {
                    date: { gte: todayStart, lte: todayEnd },
                    status: "COMPLETED"
                },
                _sum: { paidPrice: true },
                _count: true
            });
        }

        // Ganhos do Mês Selecionado
        const monthData = await prisma.appointment.aggregate({
            where: {
                date: { gte: monthStart, lte: monthEnd },
                status: "COMPLETED"
            },
            _sum: { paidPrice: true },
            _count: true
        });

        // Ganhos do Ano Selecionado
        const yearStart = startOfYear(selectedDate);
        const yearEnd = endOfYear(selectedDate);

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
