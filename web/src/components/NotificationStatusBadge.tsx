"use client";

import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellOff, BellRing, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export function NotificationStatusBadge() {
    const { permission, loading, requestPermission } = useNotifications();
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine status icon and color
    const getStatusConfig = () => {
        switch (permission) {
            case 'granted':
                return {
                    icon: BellRing,
                    color: 'text-emerald-600',
                    bgColor: 'bg-emerald-100',
                    borderColor: 'border-emerald-500',
                    label: 'Ativadas',
                    description: 'Você receberá notificações 10 min antes dos atendimentos!'
                };
            case 'denied':
                return {
                    icon: BellOff,
                    color: 'text-red-600',
                    bgColor: 'bg-red-100',
                    borderColor: 'border-red-500',
                    label: 'Bloqueadas',
                    description: 'Permissão negada. Ative nas configurações do navegador.'
                };
            default:
                return {
                    icon: Bell,
                    color: 'text-amber-600',
                    bgColor: 'bg-amber-100',
                    borderColor: 'border-amber-500',
                    label: 'Desativadas',
                    description: 'Clique para ativar e receber alertas!'
                };
        }
    };

    const config = getStatusConfig();
    const StatusIcon = config.icon;

    return (
        <div className="relative">
            {/* Badge Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${config.borderColor} ${config.bgColor} transition-all hover:shadow-md`}
                title="Status das Notificações"
            >
                <StatusIcon className={`h-5 w-5 ${config.color} ${permission === 'granted' ? 'animate-pulse' : ''}`} />
                <span className={`text-sm font-bold ${config.color} hidden md:inline`}>
                    {config.label}
                </span>
                {permission === 'granted' && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                )}
            </button>

            {/* Expanded Panel */}
            {isExpanded && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border-2 border-zinc-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <StatusIcon className={`h-6 w-6 ${config.color}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-zinc-900 mb-1">
                                Notificações {config.label}
                            </h3>
                            <p className="text-sm text-zinc-600">
                                {config.description}
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    {permission !== 'granted' && (
                        <button
                            onClick={() => {
                                requestPermission();
                                setIsExpanded(false);
                            }}
                            disabled={loading || permission === 'denied'}
                            className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                    Ativando...
                                </>
                            ) : permission === 'denied' ? (
                                <>
                                    <AlertTriangle className="h-4 w-4" />
                                    Bloqueado pelo Navegador
                                </>
                            ) : (
                                <>
                                    <BellRing className="h-4 w-4" />
                                    Ativar Notificações
                                </>
                            )}
                        </button>
                    )}

                    {permission === 'denied' && (
                        <p className="text-xs text-zinc-500 mt-2 text-center">
                            💡 Vá em Configurações do site → Notificações → Permitir
                        </p>
                    )}

                    {permission === 'granted' && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            <p className="text-sm text-emerald-800 font-medium">
                                Tudo configurado! Você receberá alertas automáticos.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Click outside to close */}
            {isExpanded && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsExpanded(false)}
                />
            )}
        </div>
    );
}
