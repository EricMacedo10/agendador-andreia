"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function PaymentReminder() {
    const [pendingCount, setPendingCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [lastAlertDate, setLastAlertDate] = useState("");
    const router = useRouter();

    useEffect(() => {
        // Request notification permission on mount
        if ("Notification" in window) {
            Notification.requestPermission();
        }

        checkPending();

        // Check every minute
        const interval = setInterval(() => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const todayStr = format(now, "yyyy-MM-dd");

            // Check regularly
            checkPending();

            // Trigger Alert at 21:00 specifically
            if (currentHour === 21 && currentMinute === 0 && lastAlertDate !== todayStr) {
                if (pendingCount > 0) {
                    triggerAlert();
                    setLastAlertDate(todayStr);
                }
            }
        }, 60000); // 1 minute

        return () => clearInterval(interval);
    }, [pendingCount, lastAlertDate]);

    const checkPending = async () => {
        try {
            const res = await fetch("/api/dashboard/reminders");
            const data = await res.json();
            setPendingCount(data.count);
            // Show banner if count > 0
            if (data.count > 0) setIsVisible(true);
        } catch (error) {
            console.error(error);
        }
    };

    const triggerAlert = () => {
        // 1. Audio Alert
        const audio = new Audio("/sounds/notification.mp3"); // We need to add this file or use a CDN? 
        // fallback to simple beep or assume file exists. 
        // For now, let's use a standard browser notification which often has sound.

        // 2. Browser Notification
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Agendador Andreia", {
                body: `⚠️ Atenção! Você tem ${pendingCount} atendimentos de hoje sem finalizar o pagamento.`,
                icon: "/icon.png" // PWA icon
            });
        }

        // 3. Ensure banner is visible
        setIsVisible(true);
    };

    if (!isVisible || pendingCount === 0) return null;

    return (
        <div className="bg-orange-500 text-white px-4 py-3 flex justify-between items-center shadow-md animate-in slide-in-from-top">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                    <AlertTriangle size={20} className="text-white" />
                </div>
                <div>
                    <p className="font-bold text-sm md:text-base">
                        Atenção: {pendingCount} atendimentos hoje ainda não foram finalizados!
                    </p>
                    <p className="text-xs text-orange-100 hidden md:block">
                        Atualize o valor e a forma de pagamento para manter o financeiro correto.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Link
                    href="/dashboard/appointments/pending"
                    className="bg-white text-orange-600 px-3 py-1.5 rounded-md text-sm font-bold hover:bg-orange-50 transition-colors whitespace-nowrap"
                >
                    Ver Pendências
                </Link>
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
