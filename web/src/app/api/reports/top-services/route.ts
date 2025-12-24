import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Appointment, Service } from "@prisma/client";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sortBy = searchParams.get('by') || 'quantity';
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
        const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

        // Criar datas do período selecionado
        const selectedDate = new Date(year, month - 1, 1);
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);

        // Buscar agendamentos completados do período COM serviço
        const appointments = await prisma.appointment.findMany({
            where: {
                status: "COMPLETED",
                date: { gte: monthStart, lte: monthEnd }
            },
            include: { service: true }
        });

        // Agrupar por serviço
        const serviceStats = appointments.reduce((acc: any, appt: Appointment & { service: Service }) => {
            const serviceId = appt.serviceId;
            if (!acc[serviceId]) {
                acc[serviceId] = {
                    id: serviceId,
                    name: appt.service.name,
                    count: 0,
                    revenue: 0
                };
            }
            acc[serviceId].count += 1;
            acc[serviceId].revenue += Number(appt.paidPrice || 0);
            return acc;
        }, {});

        // Converter para array e ordenar
        let servicesArray = Object.values(serviceStats);

        if (sortBy === 'revenue') {
            servicesArray.sort((a: any, b: any) => b.revenue - a.revenue);
        } else {
            servicesArray.sort((a: any, b: any) => b.count - a.count);
        }

        // Retornar top 5
        return NextResponse.json({
            services: servicesArray.slice(0, 5)
        });
    } catch (error) {
        console.error("Error fetching top services:", error);
        return NextResponse.json({ error: "Failed to fetch top services" }, { status: 500 });
    }
}
