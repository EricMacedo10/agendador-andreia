"use client";

import { useState, useEffect } from "react";
import { format, addDays, subDays, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { NewAppointmentModal } from "@/components/new-appointment-modal";

type Appointment = {
    id: string;
    date: string;
    status: string;
    client: { name: string };
    service: { name: string; duration: number };
    durationMinutes?: number;
};

export default function SchedulePage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, [currentDate]);

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            // In a real app we would filter by date range.
            // For MVP we fetch all and filter in frontend or use the API filter if implemented.
            // Our API currently returns all sorted by date.
            const res = await fetch("/api/appointments");
            const allAppointments = await res.json();

            // Filter for current date
            const daysAppointments = allAppointments.filter((appt: Appointment) =>
                isSameDay(parseISO(appt.date), currentDate)
            );

            setAppointments(daysAppointments);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1));
    const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));
    const handleToday = () => setCurrentDate(new Date());

    // Generate hours 08:00 to 20:00
    const hours = Array.from({ length: 13 }, (_, i) => i + 8);

    return (
        <div className="p-6 max-w-6xl mx-auto text-zinc-900 flex h-screen flex-col overflow-hidden bg-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-rose-600 flex items-center gap-2">
                        <CalendarIcon /> Agenda
                    </h1>
                    <p className="text-zinc-500">Gerencie seus compromissos diários</p>
                </div>

                <div className="flex items-center gap-4 bg-zinc-100 p-2 rounded-xl border border-zinc-200">
                    <button onClick={handlePrevDay} className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="text-center min-w-[180px]">
                        <div className="font-bold text-lg capitalize text-zinc-900">
                            {format(currentDate, "EEEE", { locale: ptBR })}
                        </div>
                        <div className="text-sm text-zinc-500">
                            {format(currentDate, "d 'de' MMMM", { locale: ptBR })}
                        </div>
                    </div>
                    <button onClick={handleNextDay} className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600">
                        <ChevronRight size={20} />
                    </button>
                    <button onClick={handleToday} className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 uppercase">
                        Hoje
                    </button>
                </div>

                <button
                    onClick={() => {
                        setEditingAppointment(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-rose-900/20"
                >
                    <Plus size={20} />
                    Novo Agendamento
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto bg-white border border-zinc-200 rounded-2xl relative shadow-sm">
                {hours.map(hour => (
                    <div key={hour} className="flex border-b border-zinc-100 min-h-[100px] group hover:bg-zinc-50 transition-colors">
                        {/* Time Column */}
                        <div className="w-20 border-r border-zinc-100 flex items-start justify-center pt-4 text-zinc-400 font-bold text-sm bg-zinc-50/50">
                            {hour}:00
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 relative p-1">
                            {/* Render appointments for this hour */}
                            {appointments
                                .filter(appt => parseISO(appt.date).getHours() === hour)
                                .map(appt => {
                                    const isCompleted = appt.status === "COMPLETED";
                                    const apptDate = parseISO(appt.date);
                                    const isPast = apptDate < new Date() && !isCompleted;

                                    let bgClass = "bg-rose-100 border-rose-500 text-rose-900 hover:bg-rose-200";
                                    let badgeClass = "text-rose-700";

                                    if (isCompleted) {
                                        bgClass = "bg-emerald-100 border-emerald-500 text-emerald-900 hover:bg-emerald-200";
                                        badgeClass = "text-emerald-700";
                                    } else if (isPast) {
                                        bgClass = "bg-orange-100 border-orange-500 text-orange-900 hover:bg-orange-200 animate-pulse";
                                        badgeClass = "text-orange-700";
                                    }

                                    return (
                                        <div
                                            key={appt.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingAppointment(appt);
                                                setIsModalOpen(true);
                                            }}
                                            className={`mb-1 p-3 border-l-4 rounded-r-lg transition-colors cursor-pointer shadow-sm relative z-10 ${bgClass}`}
                                        >
                                            <div className="font-bold flex justify-between items-center">
                                                <span>{appt.client.name}</span>
                                                <div className="flex items-center gap-1">
                                                    {isCompleted && <span title="Pago">💰</span>}
                                                    {isPast && <span title="Pagamento Pendente">⚠️</span>}
                                                    <span className={`text-sm font-bold bg-white/50 px-2 rounded-md ${badgeClass}`}>
                                                        {format(apptDate, "HH:mm")}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium opacity-80 flex justify-between">
                                                <span>{appt.service.name}</span>
                                                <span>{appt.durationMinutes || appt.service.duration} min</span>
                                            </div>
                                        </div>
                                    )
                                })}

                            {/* Empty State / Add Slot helper */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                                onClick={() => {
                                    setEditingAppointment(null);
                                    // Set modal date/time
                                    const dateWithTime = new Date(currentDate);
                                    dateWithTime.setHours(hour, 0, 0, 0);
                                    setCurrentDate(dateWithTime); // Optional, or pass as prop

                                    // HACK: Pass time via explicit prop or just rely on preselectedDate matching hour if we pass it correctly
                                    // Let's modify state to just pass this date
                                    setIsModalOpen(true);
                                }}
                            >
                                <span className="text-zinc-400 text-xs font-bold">+ Adicionar em {hour}:00</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <NewAppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchAppointments();
                }}
                preselectedDate={currentDate}
                appointmentToEdit={editingAppointment}
            />
        </div>
    );
}
