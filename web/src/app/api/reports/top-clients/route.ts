import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Appointment, Client } from "@prisma/client";

export async function GET() {
    try {
        // Buscar todos agendamentos completados com cliente
        const appointments = await prisma.appointment.findMany({
            where: { status: "COMPLETED" },
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

        // Converter para array e ordenar por visitas
        const clientsArray = Object.values(clientStats);
        clientsArray.sort((a: any, b: any) => b.visits - a.visits);

        // Retornar top 10
        return NextResponse.json({
            clients: clientsArray.slice(0, 10)
        });
    } catch (error) {
        console.error("Error fetching top clients:", error);
        return NextResponse.json({ error: "Failed to fetch top clients" }, { status: 500 });
    }
}
