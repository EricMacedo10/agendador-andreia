import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Appointment, Client } from "@prisma/client";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
        const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

        // Criar datas do período selecionado
        const selectedDate = new Date(year, month - 1, 1);
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);

        // Buscar agendamentos completados do período COM cliente
        const appointments = await prisma.appointment.findMany({
            where: {
                status: "COMPLETED",
                date: { gte: monthStart, lte: monthEnd }
            },
            include: { client: true }
        });

        // Agrupar por cliente
        const clientStats = appointments.reduce((acc: any, appt: Appointment & { client: Client }) => {
            const clientId = appt.clientId;
            if (!acc[clientId]) {
                acc[clientId] = {
                    id: clientId,
                    name: appt.client.name,
                    visits: 0,
                    totalSpent: 0
                };
            }
            acc[clientId].visits += 1;
            acc[clientId].totalSpent += Number(appt.paidPrice || 0);
            return acc;
        }, {});

        // Converter para array e ordenar por valor gasto (R$)
        const clientsArray = Object.values(clientStats);
        clientsArray.sort((a: any, b: any) => b.totalSpent - a.totalSpent);


        // Retornar top 10
        return NextResponse.json({
            clients: clientsArray.slice(0, 10)
        });
    } catch (error) {
        console.error("Error fetching top clients:", error);
        return NextResponse.json({ error: "Failed to fetch top clients" }, { status: 500 });
    }
}
