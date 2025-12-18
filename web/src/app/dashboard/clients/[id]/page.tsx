
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Calendar, User, Phone, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ClientDetailsPage({ params }: { params: { id: string } }) {
    // Await params for Next.js 15+ compatibility if needed, though 14 works directly usually.
    // Ideally we should await if type suggests it, but standard Next.js 14 params are objects.
    const { id } = await params;

    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            appointments: {
                orderBy: { date: 'desc' },
                include: { service: true }
            }
        }
    });

    if (!client) {
        notFound();
    }

    const totalSpent = client.appointments.reduce((acc, appt) => {
        return acc + Number(appt.service.price);
    }, 0);

    const nextAppointment = client.appointments.find(a => new Date(a.date) > new Date());
    const lastAppointment = client.appointments.find(a => new Date(a.date) < new Date());

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/clients" className="p-2 -ml-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors">
                    <ArrowLeft />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">{client.name}</h1>
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                        <Phone size={14} /> {client.phone}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-2 text-rose-600 mb-2 font-medium">
                        <DollarSign size={20} /> Total Gasto
                    </div>
                    <p className="text-2xl font-bold text-zinc-900">R$ {totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-2 text-blue-600 mb-2 font-medium">
                        <Calendar size={20} /> Agendamentos
                    </div>
                    <p className="text-2xl font-bold text-zinc-900">{client.appointments.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-2 text-green-600 mb-2 font-medium">
                        <Clock size={20} /> Última Visita
                    </div>
                    <p className="text-lg font-bold text-zinc-900">
                        {lastAppointment
                            ? format(new Date(lastAppointment.date), "dd/MM/yyyy", { locale: ptBR })
                            : "Nenhuma"}
                    </p>
                </div>
            </div>

            {/* Appointment History */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100">
                    <h2 className="font-bold text-zinc-900">Histórico de Agendamentos</h2>
                </div>
                <div className="divide-y divide-zinc-100">
                    {client.appointments.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">
                            Nenhum agendamento registrado.
                        </div>
                    ) : (
                        client.appointments.map(appt => {
                            const isFuture = new Date(appt.date) > new Date();
                            return (
                                <div key={appt.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${isFuture ? 'bg-green-500' : 'bg-zinc-300'}`}>
                                            {format(new Date(appt.date), "dd")}
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-900">{appt.service.name}</p>
                                            <p className="text-sm text-zinc-500">
                                                {format(new Date(appt.date), "MMMM yyyy • HH:mm", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-zinc-900">R$ {Number(appt.service.price).toFixed(2)}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${isFuture ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                                            {isFuture ? 'Agendado' : 'Concluído'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
