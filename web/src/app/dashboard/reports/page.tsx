"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Award, Users, DollarSign, Calendar, CreditCard, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Types
type YearData = {
    year: number;
    appointmentCount: number;
    totalRevenue: number;
};

type SummaryData = {
    year: number;
    totalRevenue: number;
    totalAppointments: number;
    averageTicket: number;
    monthlyBreakdown: MonthlyData[];
    paymentMethodBreakdown: PaymentMethodData[];
};

type MonthlyData = {
    month: number;
    monthName: string;
    revenue: number;
    appointments: number;
};

type PaymentMethodData = {
    method: string;
    count: number;
    total: number;
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
    phone: string;
    totalAppointments: number;
    totalSpent: number;
    averageTicket: number;
    lastVisit: string;
    favoriteService: string;
};

type DebtClientData = {
    id: string;
    name: string;
    phone: string;
    debtAmount: number;
    lastVisit: string | null;
};

export default function ReportsPage() {
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [topServices, setTopServices] = useState<ServiceData[]>([]);
    const [servicesMetric, setServicesMetric] = useState<'count' | 'revenue'>('count');
    const [topClients, setTopClients] = useState<ClientData[]>([]);
    const [debtClients, setDebtClients] = useState<DebtClientData[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch available years on mount
    useEffect(() => {
        fetchAvailableYears();
    }, []);

    // Fetch reports when year or metric changes
    useEffect(() => {
        if (selectedYear) {
            fetchReports();
        }
    }, [selectedYear, servicesMetric]);

    const fetchAvailableYears = async () => {
        try {
            const res = await fetch('/api/reports/years');
            const data = await res.json();
            if (data.years && data.years.length > 0) {
                const years = data.years.map((y: YearData) => y.year);
                setAvailableYears(years);
            } else {
                // If no data, still show current year
                setAvailableYears([new Date().getFullYear()]);
            }
        } catch (error) {
            console.error('Error fetching years:', error);
            setAvailableYears([new Date().getFullYear()]);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [summaryRes, servicesRes, clientsRes, debtRes] = await Promise.all([
                fetch(`/api/reports/summary?year=${selectedYear}`),
                fetch(`/api/reports/top-services?year=${selectedYear}&metric=${servicesMetric}`),
                fetch(`/api/reports/top-clients?year=${selectedYear}&limit=10`),
                fetch(`/api/reports/debt-clients`)
            ]);

            const summaryData = await summaryRes.json();
            const servicesData = await servicesRes.json();
            const clientsData = await clientsRes.json();
            const debtData = await debtRes.json();

            setSummary(summaryData);
            setTopServices(servicesData.services || []);
            setTopClients(clientsData.clients || []);
            setDebtClients(debtData.clients || []);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const getPaymentMethodLabel = (method: string) => {
        const labels: { [key: string]: string } = {
            'PIX': 'PIX',
            'CASH': 'Dinheiro',
            'CREDIT_CARD': 'Cartão de Crédito',
            'DEBIT_CARD': 'Cartão de Débito'
        };
        return labels[method] || method;
    };

    const getMedalIcon = (index: number) => {
        if (index === 0) return '🏆';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `${index + 1}.`;
    };

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
                    Relatórios Financeiros
                </h1>
                <p className="text-sm md:text-base text-zinc-500">Análise completa do seu negócio</p>
            </div>

            {/* Year Selector */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm">
                <p className="text-xs text-zinc-500 mb-3 text-center font-medium">SELECIONE O ANO</p>
                <div className="flex gap-2 justify-center flex-wrap">
                    {availableYears.map(year => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${selectedYear === year
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                }`}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium opacity-90">Faturamento Total</span>
                        <DollarSign className="h-6 w-6 opacity-80" />
                    </div>
                    <p className="text-4xl font-bold mb-1">
                        {formatCurrency(summary?.totalRevenue || 0)}
                    </p>
                    <p className="text-sm opacity-80">
                        {summary?.totalAppointments || 0} agendamento{summary?.totalAppointments !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium opacity-90">Ticket Médio</span>
                        <TrendingUp className="h-6 w-6 opacity-80" />
                    </div>
                    <p className="text-4xl font-bold mb-1">
                        {formatCurrency(summary?.averageTicket || 0)}
                    </p>
                    <p className="text-sm opacity-80">
                        por agendamento
                    </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium opacity-90">Ano</span>
                        <Calendar className="h-6 w-6 opacity-80" />
                    </div>
                    <p className="text-4xl font-bold mb-1">
                        {selectedYear}
                    </p>
                    <p className="text-sm opacity-80">
                        Em análise
                    </p>
                </div>
            </div>

            {/* Monthly Breakdown Table */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm overflow-x-auto">
                <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-rose-600" />
                    Faturamento Mensal
                </h2>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-200">
                            <th className="text-left py-2 px-2 font-bold text-zinc-700">Mês</th>
                            <th className="text-right py-2 px-2 font-bold text-zinc-700">Faturamento</th>
                            <th className="text-right py-2 px-2 font-bold text-zinc-700">Agendamentos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {summary?.monthlyBreakdown.map(month => (
                            <tr key={month.month} className="border-b border-zinc-100">
                                <td className="py-2 px-2 text-zinc-900">{month.monthName}</td>
                                <td className="text-right py-2 px-2 font-bold text-zinc-900">
                                    {formatCurrency(month.revenue)}
                                </td>
                                <td className="text-right py-2 px-2 text-zinc-600">
                                    {month.appointments}
                                </td>
                            </tr>
                        ))}
                        <tr className="font-bold bg-zinc-50">
                            <td className="py-3 px-2 text-zinc-900">TOTAL</td>
                            <td className="text-right py-3 px-2 text-rose-600">
                                {formatCurrency(summary?.totalRevenue || 0)}
                            </td>
                            <td className="text-right py-3 px-2 text-rose-600">
                                {summary?.totalAppointments || 0}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Payment Method Breakdown */}
            {summary?.paymentMethodBreakdown && summary.paymentMethodBreakdown.length > 0 && (
                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                    <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-emerald-600" />
                        Formas de Pagamento
                    </h2>
                    <div className="space-y-3">
                        {summary.paymentMethodBreakdown.map((method, index) => (
                            <div key={index} className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                <div>
                                    <p className="font-medium text-zinc-900">{getPaymentMethodLabel(method.method)}</p>
                                    <p className="text-sm text-zinc-500">{method.count} pagamento{method.count !== 1 ? 's' : ''}</p>
                                </div>
                                <p className="font-bold text-emerald-600 text-lg">
                                    {formatCurrency(method.total)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Services with Toggle */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                        <Award className="h-5 w-5 text-rose-600" />
                        Top 5 Serviços
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setServicesMetric('count')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${servicesMetric === 'count'
                                ? 'bg-rose-600 text-white'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                }`}
                        >
                            Mais Realizados
                        </button>
                        <button
                            onClick={() => setServicesMetric('revenue')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${servicesMetric === 'revenue'
                                ? 'bg-rose-600 text-white'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                }`}
                        >
                            Mais Lucrativos
                        </button>
                    </div>
                </div>
                {topServices.length > 0 ? (
                    <div className="space-y-3">
                        {topServices.map((service, index) => (
                            <div key={service.id} className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-rose-100 text-rose-600 font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-zinc-900">{service.name}</p>
                                        <p className="text-sm text-zinc-500">
                                            {service.count} vezes • {formatCurrency(service.revenue)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {servicesMetric === 'count' ? (
                                        <p className="font-bold text-rose-600 text-lg">{service.count}x</p>
                                    ) : (
                                        <p className="font-bold text-rose-600 text-lg">{formatCurrency(service.revenue)}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-500 text-center py-4">Nenhum dado disponível</p>
                )}
            </div>

            {/* Top 10 Clients VIP */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Top 10 Clientes VIP
                </h2>
                {topClients.length > 0 ? (
                    <div className="space-y-4">
                        {topClients.map((client, index) => (
                            <div key={client.id} className="border-b border-zinc-100 pb-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl flex-shrink-0">
                                        {getMedalIcon(index)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-zinc-900 truncate">{client.name}</p>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-zinc-600 mt-1">
                                            <span>{client.totalAppointments} visitas</span>
                                            <span className="font-bold text-blue-600">{formatCurrency(client.totalSpent)}</span>
                                            <span>Últ: {format(new Date(client.lastVisit), 'dd/MM/yy')}</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            Preferido: <span className="font-medium text-zinc-700">{client.favoriteService}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-500 text-center py-4">Nenhum dado disponível</p>
                )}
            </div>

            {/* Clientes Inadimplentes */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                    Clientes Inadimplentes
                </h2>
                {debtClients.length > 0 ? (
                    <div className="space-y-4">
                        {debtClients.map((client) => (
                            <div key={client.id} className="border-b border-zinc-100 pb-4 flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-zinc-900 truncate">{client.name}</p>
                                    <p className="text-sm text-zinc-500 flex items-center gap-2 mt-1">
                                        <span>📱 {client.phone}</span>
                                        {client.lastVisit && (
                                            <span>• Última visita: {format(new Date(client.lastVisit), 'dd/MM/yyyy')}</span>
                                        )}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-rose-500 font-bold uppercase tracking-wider mb-1">Dívida</p>
                                    <span className="font-black text-rose-600 text-lg">{formatCurrency(client.debtAmount)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <span className="text-3xl">🎉</span>
                        </div>
                        <p className="text-zinc-800 font-bold text-lg">Inadimplência Zero!</p>
                        <p className="text-zinc-500 text-sm mt-1">Nenhum cliente possui dívidas pendentes atualmente.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
