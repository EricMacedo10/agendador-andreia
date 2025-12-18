"use client";

import { useEffect, useState } from "react";
import { BUSINESS_INFO } from "@/lib/constants";

export default function SettingsPage() {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("/api/settings")
            .then((res) => res.json())
            .then((data) => {
                setEnabled(data.onlineBookingEnabled);
                setLoading(false);
            });
    }, []);

    const handleToggle = async () => {
        const newState = !enabled;
        setEnabled(newState);

        try {
            await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ onlineBookingEnabled: newState }),
            });
            setMessage(newState ? "Agendamento Online Ativado" : "Agendamento Online Desativado");
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            console.error(err);
            setEnabled(!newState); // revert
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto text-zinc-100">
            <h1 className="text-3xl font-bold text-yellow-500 mb-2">Configurações</h1>
            <p className="text-zinc-400 mb-8">Gerencie as preferências do seu negócio.</p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 border-b border-zinc-800 pb-2">Agendamento</h2>

                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium">Permitir Agendamento Online</h3>
                        <p className="text-sm text-zinc-400 mt-1 max-w-sm">
                            Quando desativado, seus clientes verão uma mensagem de "Agendamentos Fechados" ao tentar marcar.
                        </p>
                    </div>

                    <button
                        onClick={handleToggle}
                        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${enabled ? "bg-green-600" : "bg-zinc-700"
                            }`}
                    >
                        <div
                            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-0"
                                }`}
                        />
                    </button>
                </div>

                {message && (
                    <div className="mt-4 p-3 bg-zinc-800/50 text-yellow-500 text-sm rounded-lg text-center animate-pulse">
                        {message}
                    </div>
                )}
            </div>

            <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6 opacity-75">
                <h2 className="text-xl font-semibold mb-4 border-b border-zinc-800 pb-2">Informações</h2>
                <div className="space-y-2 text-zinc-400">
                    <p><span className="text-zinc-200">Nome:</span> {BUSINESS_INFO.name}</p>
                    <p><span className="text-zinc-200">WhatsApp Configurado:</span> {BUSINESS_INFO.phoneDisplay}</p>
                    <p className="text-xs mt-4">* Para alterar estas informações, contate o administrador do sistema.</p>
                </div>
            </div>
        </div>
    );
}
