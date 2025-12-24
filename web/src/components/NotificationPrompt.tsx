"use client";

import { useNotifications } from '@/hooks/useNotifications';
import { X } from 'lucide-react';
import { useState } from 'react';

export function NotificationPrompt() {
    const { permission, loading, requestPermission } = useNotifications();
    const [dismissed, setDismissed] = useState(false);

    // Don't show if already granted, denied, or user dismissed
    if (permission !== 'default' || dismissed) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 mb-4 rounded-lg shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🔔</span>
                        <h3 className="font-semibold text-gray-900">
                            Ative as Notificações
                        </h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                        Receba alertas 10 minutos antes de cada atendimento, mesmo com o app fechado!
                    </p>
                    <button
                        onClick={requestPermission}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Ativando...' : 'Ativar Notificações'}
                    </button>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    aria-label="Dismiss"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
