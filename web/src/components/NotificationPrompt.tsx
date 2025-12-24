"use client";

import { useNotifications } from '@/hooks/useNotifications';
import { Bell, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function NotificationPrompt() {
    const { permission, loading, requestPermission } = useNotifications();
    const [dismissed, setDismissed] = useState(false);
    const [hasToken, setHasToken] = useState(true); // Assume true to avoid flash

    useEffect(() => {
        // Check if FCM token is saved in backend
        fetch('/api/notifications/test')
            .then(r => r.json())
            .then(data => {
                // If no token found, show the prompt
                if (data.error || !data.tokenExists) {
                    setHasToken(false);
                }
            })
            .catch(() => setHasToken(false));
    }, []);

    // Show if: no token saved AND (not dismissed OR permission is default/granted)
    if (hasToken || dismissed) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 mb-4 rounded-lg shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Bell className="text-blue-600" size={24} />
                        <h3 className="font-semibold text-gray-900">
                            {permission === 'granted' ? '🔄 Reativar Notificações' : '🔔 Ativar Notificações'}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                        {permission === 'granted'
                            ? 'Clique para configurar as notificações corretamente e receber alertas 10 minutos antes de cada atendimento!'
                            : 'Receba alertas 10 minutos antes de cada atendimento, mesmo com o app fechado!'
                        }
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
