
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Calendar, User, Phone, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReceivePaymentModal from "@/components/receive-payment-modal";
import { Wallet } from "lucide-react";

export default async function ClientDetailsPage({ params }: { params: any }) {
    // Next.js 15+ compatible await for params
    const { id } = await params;

    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            appointments: {
                orderBy: { date: 'desc' },
                include: { services: { include: { service: true } } }
            },
            credits: { include: { service: true } },
            walletHistory: {
                orderBy: { createdAt: 'desc' },
                take: 5
            }
        }
    });

    if (!client) {
        notFound();
    }

    const totalSpent = client.appointments.reduce((acc: number, appt: any) => {
        const apptTotal = appt.services?.reduce((sum: number, s: any) => sum + Number(s.priceSnapshot || s.service.price), 0) || 0;
        return acc + apptTotal;
    }, 0);

    const nextAppointment = client.appointments.find((a: any) => new Date(a.date) > new Date());
    const lastAppointment = client.appointments.find((a: any) => new Date(a.date) < new Date());

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

            {/* Carteira Financeira (Dívidas/Créditos em R$) */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                    <h2 className="font-bold text-zinc-900 flex items-center gap-2">
                        <Wallet className="text-zinc-400" size={20} /> Carteira Financeira
                    </h2>
                    <ReceivePaymentModal 
                        clientId={client.id} 
                        clientName={client.name} 
                        currentBalance={Number(client.balance || 0)} 
                    />
                </div>
                <div className="p-6 flex flex-col md:flex-row gap-6">
                    <div className={`p-4 rounded-xl flex-1 flex flex-col justify-center items-center ${Number(client.balance || 0) < 0 ? 'bg-rose-50 border border-rose-100' : Number(client.balance || 0) > 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-zinc-50 border border-zinc-100'}`}>
                        <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-1">Saldo Atual</p>
                        <p className={`text-3xl font-black ${Number(client.balance || 0) < 0 ? 'text-rose-600' : Number(client.balance || 0) > 0 ? 'text-emerald-600' : 'text-zinc-600'}`}>
                            R$ {Number(client.balance || 0).toFixed(2)}
                        </p>
                        <p className="text-xs mt-1 font-medium">
                            {Number(client.balance || 0) < 0 ? '🔴 Dívida pendente' : Number(client.balance || 0) > 0 ? '🟢 Crédito disponível' : '⚪ Sem pendências'}
                        </p>
                    </div>

                    <div className="flex-[2] space-y-3">
                        <p className="text-sm font-bold text-zinc-700">Últimas Movimentações</p>
                        <div className="space-y-2">
                            {client.walletHistory.length === 0 ? (
                                <p className="text-zinc-400 text-xs py-4 text-center italic">Nenhuma movimentação financeira recente.</p>
                            ) : (
                                client.walletHistory.map((h: any) => (
                                    <div key={h.id} className="flex justify-between items-center p-2 rounded-lg bg-zinc-50 border border-zinc-100 text-xs">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-zinc-800">{h.description}</span>
                                            <span className="text-zinc-400">{format(new Date(h.createdAt), "dd/MM/yyyy HH:mm")}</span>
                                        </div>
                                        <span className={`font-black ${h.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {h.amount > 0 ? '+' : ''} R$ {Number(h.amount).toFixed(2)}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Client Wallet (Credits/Packages) */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                    <h2 className="font-bold text-zinc-900 flex items-center gap-2">
                        👛 Carteira de Créditos
                    </h2>
                    <Link href={`/dashboard/clients/${client.id}/credits/new`} className="text-sm bg-zinc-900 text-white px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors">
                        + Adicionar Manualmente
                    </Link>
                </div>
                <div className="p-6">
                    {!client.credits || client.credits.length === 0 ? (
                        <p className="text-zinc-500 text-sm text-center py-4">Nenhum crédito disponível para esta cliente.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {client.credits.filter((c: any) => c.balance > 0).map((credit: any) => (
                                <div key={credit.id} className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-emerald-900">{credit.service.name}</p>
                                        <p className="text-sm text-emerald-700">{credit.balance} {credit.balance === 1 ? 'sessão disponível' : 'sessões disponíveis'}</p>
                                    </div>
                                </div>
                            ))}
                            {client.credits.filter((c: any) => c.balance > 0).length === 0 && (
                                <p className="text-zinc-500 text-sm text-center py-4 col-span-2">Os saldos anteriores já foram consumidos.</p>
                            )}
                        </div>
                    )}
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
                                            <p className="font-bold text-zinc-900">
                                                {appt.services?.map((s: any) => s.service.name).join(', ') || 'Serviço Excluído'}
                                            </p>
                                            <p className="text-sm text-zinc-500">
                                                {format(new Date(appt.date), "MMMM yyyy • HH:mm", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-zinc-900">
                                            R$ {appt.paidPrice ? Number(appt.paidPrice).toFixed(2) : (appt.services?.reduce((sum: number, s: any) => sum + Number(s.priceSnapshot || s.service.price), 0) || 0).toFixed(2)}
                                        </p>
                                        <div className="flex flex-col gap-1 items-end mt-1">
                                            <span className={`text-xs px-2 py-1 rounded-full ${isFuture ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                                                {isFuture ? 'Agendado' : 'Concluído'}
                                            </span>
                                            {appt.paymentMethod === 'PACKAGE_CREDIT' && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                                    Abatido por Pacote
                                                </span>
                                            )}
                                        </div>
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
