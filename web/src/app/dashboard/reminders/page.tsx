"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { MessageSquare, CheckCircle2, Clock, User } from "lucide-react";
import { getUpcomingReminders, markAsReminded } from "./actions";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { clsx } from "clsx";

export default function RemindersPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAppointments = async () => {
            try {
                const data = await getUpcomingReminders();
                setAppointments(data);
            } catch (error) {
                console.error("Erro ao carregar lembretes:", error);
            } finally {
                setLoading(false);
            }
        };

        loadAppointments();
    }, []);

    const handleSendReminder = async (appt: any) => {
        const serviceNames = appt.services.map((s: any) => s.service.name).join(", ");
        const timeFormatted = format(new Date(appt.date), "HH:mm");

        const link = generateWhatsAppLink(
            appt.client.phone,
            appt.client.name,
            serviceNames,
            timeFormatted
        );

        // Abre o link em nova aba
        window.open(link, "_blank");

        // Marca como enviado no banco de dados
        try {
            await markAsReminded(appt.id);
            // Atualiza estado local para feedback visual imediato
            setAppointments(prev => prev.map(a =>
                a.id === appt.id ? { ...a, whatsappReminderSent: true } : a
            ));
        } catch (error) {
            console.error("Erro ao marcar como enviado:", error);
        }
    };

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-zinc-900">Lembretes de Amanhã 📲</h1>
                <p className="text-zinc-500 text-sm">
                    Envie mensagens para as clientes com agendamento marcado para amanhã.
                </p>
            </header>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-600 border-t-transparent"></div>
                </div>
            ) : appointments.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {appointments.map((appt) => (
                        <div
                            key={appt.id}
                            className={clsx(
                                "flex flex-col gap-4 rounded-xl border p-4 shadow-sm transition-all",
                                appt.whatsappReminderSent
                                    ? "bg-zinc-50 border-zinc-200"
                                    : "bg-white border-rose-100"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        "flex h-10 w-10 items-center justify-center rounded-full font-bold",
                                        appt.whatsappReminderSent ? "bg-zinc-200 text-zinc-500" : "bg-rose-100 text-rose-600"
                                    )}>
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-zinc-900">{appt.client.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(appt.date), "HH:mm")}
                                        </div>
                                    </div>
                                </div>
                                {appt.whatsappReminderSent && (
                                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 uppercase">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Confirmado
                                    </div>
                                )}
                            </div>

                            <div className="text-sm text-zinc-600 flex-1">
                                <span className="font-semibold text-zinc-700">Serviços:</span>
                                <p className="mt-0.5">{appt.services.map((s: any) => s.service.name).join(", ")}</p>
                            </div>

                            <button
                                onClick={() => handleSendReminder(appt)}
                                className={clsx(
                                    "flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-all w-full",
                                    appt.whatsappReminderSent
                                        ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                        : "bg-[#25D366] text-white shadow-md hover:bg-[#128C7E] active:scale-[0.98]"
                                )}
                            >
                                <MessageSquare className="h-4 w-4" />
                                {appt.whatsappReminderSent ? "Reenviar Lembrete" : "Enviar WhatsApp"}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-16 text-center bg-white">
                    <div className="mb-4 rounded-full bg-zinc-100 p-4">
                        <CheckCircle2 className="h-8 w-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">Tudo em dia!</h3>
                    <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-1 px-4">
                        Nenhum agendamento pendente de lembrete para amanhã.
                    </p>
                </div>
            )}
        </div>
    );
}
