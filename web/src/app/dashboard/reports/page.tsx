"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Award, Users, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type ReportData = {
    today: { revenue: number; count: number };
    month: { revenue: number; count: number };
    year: { revenue: number; count: number };
};

type ServiceData = {
    id: string;
    name: string;
    count: number;
    revenue: number;
};

type ClientData = {
    id: string;
    name: string;
    visits: number;
    totalSpent: number;
};

export default function ReportsPage() {
    const [summary, setSummary] = useState<ReportData | null>(null);
    const [topServicesByQty, setTopServicesByQty] = useState<ServiceData[]>([]);
    const [topServicesByRevenue, setTopServicesByRevenue] = useState<ServiceData[]>([]);
    const [topClients, setTopClients] = useState<ClientData[]>([]);
    const [loading, setLoading] = useState(true);

    // Período selecionado (mês/ano)
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        fetchReports();
    }, [selectedDate]); // Atualiza quando muda o período

    const fetchReports = async () => {
        setLoading(true);
        try {
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth() + 1; // 1-12

            // Buscar todas as APIs em paralelo com parâmetros de período
            const [summaryRes, servicesQtyRes, servicesRevRes, clientsRes] = await Promise.all([
                fetch(`/api/reports/summary?year=${year}&month=${month}`),
                fetch(`/api/reports/top-services?by=quantity&year=${year}&month=${month}`),
                fetch(`/api/reports/top-services?by=revenue&year=${year}&month=${month}`),
                fetch(`/api/reports/top-clients?year=${year}&month=${month}`)
            ]);

            const summaryData = await summaryRes.json();
            const servicesQtyData = await servicesQtyRes.json();
            const servicesRevData = await servicesRevRes.json();
            const clientsData = await clientsRes.json();

            setSummary(summaryData);
            setTopServicesByQty(servicesQtyData.services || []);
            setTopServicesByRevenue(servicesRevData.services || []);
            setTopClients(clientsData.clients || []);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    // Navegação de período
    const handlePreviousMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setSelectedDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setSelectedDate(newDate);
    };

    const handleCurrentMonth = () => {
        setSelectedDate(new Date());
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
                    <p className="text-zinc-500">Carregando relatórios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 pb-24">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-rose-600 flex items-center gap-2">
                    <TrendingUp className="h-7 w-7" />
                    Relatórios
                </h1>
                <p className="text-sm md:text-base text-zinc-500">Análise financeira e desempenho</p>
            </div>

            {/* Seletor de Período - MOBILE OPTIMIZED */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm">
                <p className="text-xs text-zinc-500 mb-3 text-center font-medium">PERÍODO</p>
                <div className="flex items-center justify-between gap-3">
                    <button
                        onClick={handlePreviousMonth}
                        className="flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                        aria-label="Mês anterior"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    <div className="flex-1 text-center">
                        <p className="text-lg font-bold text-zinc-900 capitalize">
                            {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                    </div>

                    <button
                        onClick={handleNextMonth}
                        className="flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                        aria-label="Próximo mês"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>

                <button
                    onClick={handleCurrentMonth}
                    className="w-full mt-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                    Mês Atual
                </button>
            </div>

            {/* Cards de Resumo Financeiro - MOBILE OPTIMIZED */}
            <div className="grid grid-cols-1 gap-4">
                {/* Ganhos do Dia */}
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium opacity-90">Ganhos Hoje</span>
                        <DollarSign className="h-6 w-6 opacity-80" />
                    </div>
                    <p className="text-4xl font-bold mb-1">
                        {formatCurrency(summary?.today.revenue || 0)}
                    </p>
                    <p className="text-sm opacity-80">
                        {summary?.today.count || 0} agendamento{summary?.today.count !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Ganhos do Mês */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium opacity-90">Ganhos Este Mês</span>
                        <TrendingUp className="h-6 w-6 opacity-80" />
                    </div>
                    <p className="text-4xl font-bold mb-1">
                        {formatCurrency(summary?.month.revenue || 0)}
                    </p>
                    <p className="text-sm opacity-80">
                        {summary?.month.count || 0} agendamento{summary?.month.count !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Ganhos do Ano */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium opacity-90">Ganhos Este Ano</span>
                        <Award className="h-6 w-6 opacity-80" />
                    </div>
                    <p className="text-4xl font-bold mb-1">
                        {formatCurrency(summary?.year.revenue || 0)}
                    </p>
                    <p className="text-sm opacity-80">
                        {summary?.year.count || 0} agendamento{summary?.year.count !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Top Serviços - Por Quantidade */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-rose-600" />
                    Serviços Mais Realizados
                </h2>
                {topServicesByQty.length > 0 ? (
                    <div className="space-y-3">
                        {topServicesByQty.map((service, index) => (
                            <div key={service.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-rose-100 text-rose-600 font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-zinc-900">{service.name}</p>
                                        <p className="text-sm text-zinc-500">{formatCurrency(service.revenue)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-rose-600 text-lg">{service.count}x</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-500 text-center py-4">Nenhum dado disponível</p>
                )}
            </div>

            {/* Top Serviços - Por Faturamento */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    Serviços Mais Lucrativos
                </h2>
                {topServicesByRevenue.length > 0 ? (
                    <div className="space-y-3">
                        {topServicesByRevenue.map((service, index) => (
                            <div key={service.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-zinc-900">{service.name}</p>
                                        <p className="text-sm text-zinc-500">{service.count} vezes</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-emerald-600">{formatCurrency(service.revenue)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-500 text-center py-4">Nenhum dado disponível</p>
                )}
            </div>

            {/* Top Clientes */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Clientes VIP
                </h2>
                {topClients.length > 0 ? (
                    <div className="space-y-3">
                        {topClients.slice(0, 5).map((client, index) => (
                            <div key={client.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                                        {client.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-zinc-900">{client.name}</p>
                                        <p className="text-sm font-bold text-blue-600">{formatCurrency(client.totalSpent)}</p>
                                    </div>

                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-blue-600 text-lg">{client.visits}x</p>
                                    <p className="text-xs text-zinc-500">visitas</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-500 text-center py-4">Nenhum dado disponível</p>
                )}
            </div>
        </div>
    );
}
