import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET(request: Request) {
    try {
        const now = new Date();
        const firstDayOfMonth = startOfMonth(now);
        const lastDayOfMonth = endOfMonth(now);

        // 1. Total Revenue (All Time)
        const allCompleted = await prisma.appointment.findMany({
            where: { status: "COMPLETED" },
            select: { paidPrice: true, paymentMethod: true, service: true, date: true }
        });

        const totalRevenue = allCompleted.reduce((acc, curr) => acc + Number(curr.paidPrice || 0), 0);

        // 2. Monthly Revenue
        const monthlyAppointments = allCompleted.filter(a => {
            const d = new Date(a.date);
            return d >= firstDayOfMonth && d <= lastDayOfMonth;
        });
        const monthlyRevenue = monthlyAppointments.reduce((acc, curr) => acc + Number(curr.paidPrice || 0), 0);

        // 3. Last Month Revenue (for comparison)
        const firstDayLastMonth = startOfMonth(subMonths(now, 1));
        const lastDayLastMonth = endOfMonth(subMonths(now, 1));
        const lastMonthAppointments = allCompleted.filter(a => {
            const d = new Date(a.date);
            return d >= firstDayLastMonth && d <= lastDayLastMonth;
        });
        const lastMonthRevenue = lastMonthAppointments.reduce((acc, curr) => acc + Number(curr.paidPrice || 0), 0);

        // 4. Revenue by Payment Method
        const byMethod: Record<string, number> = {};
        allCompleted.forEach(a => {
            const method = a.paymentMethod || "OUTROS";
            byMethod[method] = (byMethod[method] || 0) + Number(a.paidPrice || 0);
        });

        // 5. Top Services
        const byService: Record<string, number> = {};
        allCompleted.forEach(a => {
            const name = a.service.name;
            byService[name] = (byService[name] || 0) + Number(a.paidPrice || 0);
        });

        const topServices = Object.entries(byService)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5

        return NextResponse.json({
            totalRevenue,
            monthlyRevenue,
            lastMonthRevenue,
            byMethod,
            topServices,
            totalAppointments: allCompleted.length
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch financials" }, { status: 500 });
    }
}
