"use client";

import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, CreditCard, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function FinancialPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/financial")
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    if (loading) return <div className="p-8 text-center text-zinc-500">Carregando finanças... 💰</div>;

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const isProfit = data.monthlyRevenue >= data.lastMonthRevenue;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-2">
                    <TrendingUp className="text-emerald-600" /> Financeiro
                </h1>
                <p className="text-zinc-500">Acompanhe o crescimento do seu negócio.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Monthly Revenue */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={80} className="text-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-emerald-600 mb-1 flex items-center gap-1">
                        <TrendingUp size={16} /> Faturamento (Mês)
                    </p>
                    <h2 className="text-3xl font-bold text-zinc-900">{formatCurrency(data.monthlyRevenue)}</h2>
                    <div className="mt-2 text-xs font-medium flex items-center gap-1">
                        {isProfit ? (
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                                <ArrowUpRight size={12} /> Crescimento
                            </span>
                        ) : (
                            <span className="text-red-500 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1">
                                <ArrowDownRight size={12} /> Queda
                            </span>
                        )}
                        <span className="text-zinc-400">vs Mês Passado ({formatCurrency(data.lastMonthRevenue)})</span>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <p className="text-sm font-bold text-blue-600 mb-1 flex items-center gap-1">
                        <Award size={16} /> Faturamento Total (Todo Período)
                    </p>
                    <h2 className="text-3xl font-bold text-zinc-900">{formatCurrency(data.totalRevenue)}</h2>
                    <p className="text-xs text-zinc-400 mt-2">{data.totalAppointments} atendimentos realizados</p>
                </div>

                {/* Top Method */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <p className="text-sm font-bold text-purple-600 mb-1 flex items-center gap-1">
                        <CreditCard size={16} /> Método Favorito
                    </p>
                    {data.byMethod && Object.keys(data.byMethod).length > 0 ? (
                        <>
                            <h2 className="text-3xl font-bold text-zinc-900">
                                {Object.entries(data.byMethod).sort(([, a], [, b]) => (b as number) - (a as number))[0][0]}
                            </h2>
                            <p className="text-xs text-zinc-400 mt-2">Maior volume de pagamentos</p>
                        </>
                    ) : (
                        <h2 className="text-xl text-zinc-400">Sem dados</h2>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Methods Chart (Simple CSS Bars) */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <h3 className="font-bold text-zinc-900 mb-6 border-b pb-2">Receita por Forma de Pagamento</h3>
                    <div className="space-y-4">
                        {Object.entries(data.byMethod || {}).map(([method, value]: [string, any]) => {
                            const percent = (value / data.totalRevenue) * 100;
                            return (
                                <div key={method}>
                                    <div className="flex justify-between text-sm font-bold mb-1">
                                        <span className="text-zinc-700">
                                            {method === "PIX" && "💠 PIX"}
                                            {method === "CASH" && "💵 Dinheiro"}
                                            {method === "CREDIT_CARD" && "💳 Crédito"}
                                            {method === "DEBIT_CARD" && "💳 Débito"}
                                            {!["PIX", "CASH", "CREDIT_CARD", "DEBIT_CARD"].includes(method) && method}
                                        </span>
                                        <span className="text-zinc-900">{formatCurrency(value)}</span>
                                    </div>
                                    <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${method === 'PIX' ? 'bg-emerald-500' :
                                                method === 'CASH' ? 'bg-green-600' :
                                                    method === 'CREDIT_CARD' ? 'bg-blue-500' : 'bg-purple-500'
                                                }`}
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Services List */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <h3 className="font-bold text-zinc-900 mb-6 border-b pb-2">Serviços Mais Lucrativos 🏆</h3>
                    <div className="space-y-4">
                        {data.topServices.map((service: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 hover:bg-zinc-50 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-zinc-200 text-zinc-700' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-zinc-50 text-zinc-400'
                                        }`}>
                                        {index + 1}º
                                    </div>
                                    <span className="font-medium text-zinc-700">{service.name}</span>
                                </div>
                                <span className="font-bold text-zinc-900">{formatCurrency(service.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
