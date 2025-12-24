"use client";

import Link from "next/link";
import { Calendar, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        count: 0,
        earnings: 0,
        nextClient: null as { name: string, service: string, time: string } | null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/dashboard/stats")
            .then(r => r.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const getGreeting = () => {
        const hour = new Date().getHours();

        if (hour >= 0 && hour < 12) {
            return "Bom dia, Andreia! ☀️";
        } else if (hour >= 12 && hour < 18) {
            return "Boa tarde, Andreia! 🌤️";
        } else {
            return "Boa noite, Andreia! 🌙";
        }
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho Mobile-First */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-zinc-900">{getGreeting()}</h1>
                <p className="text-sm text-zinc-500">Aqui está o resumo do seu dia.</p>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {/* Card 1: Agendamentos */}
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-rose-600">
                        <Calendar className="h-5 w-5" />
                        <span className="text-sm font-medium">Hoje</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-zinc-900">
                        {loading ? "..." : stats.count}
                    </p>
                    <p className="text-xs text-zinc-500">Agendamentos</p>
                </div>

                {/* Card 2: Faturamento */}
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-sm font-medium">Ganhos</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-zinc-900">
                        {loading ? "..." : formatCurrency(stats.earnings)}
                    </p>
                    <p className="text-xs text-zinc-500">Estimado hoje</p>
                </div>
            </div>

            {/* Próximo Cliente */}
            {stats.nextClient ? (
                <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                    <h2 className="mb-3 text-sm font-semibold text-rose-900">
                        Próximo Cliente ({format(new Date(stats.nextClient.time), "HH:mm")})
                    </h2>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-200 text-rose-700 font-bold">
                                {stats.nextClient.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium text-zinc-900">{stats.nextClient.name}</p>
                                <p className="text-xs text-zinc-600">{stats.nextClient.service}</p>
                            </div>
                        </div>
                        <Link href="/dashboard/schedule" className="rounded-full bg-rose-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-rose-700">
                            Ver
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-center text-zinc-500 text-sm">
                    Nenhum próximo cliente hoje.
                </div>
            )}

            {/* Botões de Ação Rápida */}
            <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/clients/new" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 py-6 shadow-sm hover:bg-zinc-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Users className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700">Novo Cliente</span>
                </Link>

                <Link href="/dashboard/schedule" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 py-6 shadow-sm hover:bg-zinc-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700">Agenda</span>
                </Link>
            </div>
        </div>
    );
}
