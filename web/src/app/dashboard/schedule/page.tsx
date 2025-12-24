"use client";

import { useState, useEffect } from "react";
import {
    format,
    addDays,
    subDays,
    isSameDay,
    parseISO,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    addMonths,
    subMonths
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, LayoutGrid, LayoutList } from "lucide-react";
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
    // View mode: 'month' or 'day'
    const [viewMode, setViewMode] = useState<'month' | 'day'>('month');

    // For day view
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    // For month view
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([]);
    const [monthDays, setMonthDays] = useState<Date[]>([]);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch appointments when view changes
    useEffect(() => {
        if (viewMode === 'day') {
            fetchDayAppointments();
        } else {
            fetchMonthAppointments();
        }
    }, [currentDate, currentMonth, viewMode]);

    // Generate month grid when month changes
    useEffect(() => {
        if (viewMode === 'month') {
            const days = generateMonthGrid(currentMonth);
            setMonthDays(days);
        }
    }, [currentMonth, viewMode]);

    // Generate array of days for month grid (starting Monday)
    const generateMonthGrid = (date: Date): Date[] => {
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // 1 = Monday
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const days: Date[] = [];
        let day = startDate;
        while (day <= endDate) {
            days.push(day);
            day = addDays(day, 1);
        }
        return days;
    };

    const fetchDayAppointments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/appointments?t=${new Date().getTime()}`);
            const allAppointments = await res.json();

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

    const fetchMonthAppointments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/appointments?t=${new Date().getTime()}`);
            const allAppointments = await res.json();

            const filtered = allAppointments.filter((appt: Appointment) => {
                const apptDate = parseISO(appt.date);
                return isSameMonth(apptDate, currentMonth);
            });

            setMonthAppointments(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Day navigation
    const handlePrevDay = () => setCurrentDate(subDays(currentDate, 1));
    const handleNextDay = () => setCurrentDate(addDays(currentDate, 1));
    const handleToday = () => setCurrentDate(new Date());

    // Month navigation
    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const handleThisMonth = () => setCurrentMonth(new Date());

    // Generate hours 08:00 to 20:00
    const hours = Array.from({ length: 13 }, (_, i) => i + 8);


    return (
        <div className="p-6 text-zinc-900 flex flex-1 h-full flex-col overflow-hidden bg-white">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-rose-600 flex items-center gap-2">
                        <CalendarIcon /> Agenda
                    </h1>
                    <p className="text-zinc-500">Gerencie seus compromissos</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    {/* View Toggle */}
                    <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl border border-zinc-200 self-start">
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${viewMode === 'month'
                                    ? 'bg-rose-600 text-white shadow-md'
                                    : 'text-zinc-600 hover:bg-zinc-200'
                                }`}
                        >
                            <LayoutGrid size={18} />
                            Mês
                        </button>
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${viewMode === 'day'
                                    ? 'bg-rose-600 text-white shadow-md'
                                    : 'text-zinc-600 hover:bg-zinc-200'
                                }`}
                        >
                            <LayoutList size={18} />
                            Dia
                        </button>
                    </div>

                    {/* Date Navigation */}
                    {viewMode === 'day' ? (
                        <div className="flex items-center gap-2 bg-zinc-100 p-2 rounded-xl border border-zinc-200 self-start">
                            <button onClick={handlePrevDay} className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="text-center min-w-[160px]">
                                <div className="font-bold text-base capitalize text-zinc-900">
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
                    ) : (
                        <div className="flex items-center gap-2 bg-zinc-100 p-2 rounded-xl border border-zinc-200 self-start">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="text-center min-w-[160px]">
                                <div className="font-bold text-base capitalize text-zinc-900">
                                    {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                                </div>
                            </div>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-zinc-200 rounded-lg transition-colors text-zinc-600">
                                <ChevronRight size={20} />
                            </button>
                            <button onClick={handleThisMonth} className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 uppercase">
                                Mês Atual
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setEditingAppointment(null);
                            setIsModalOpen(true);
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-lg shadow-rose-900/20 w-full md:w-auto"
                    >
                        <Plus size={20} />
                        Novo Agendamento
                    </button>
                </div>
            </div>

            {/* Month View */}
            {viewMode === 'month' && (
                <div className="flex-1 overflow-y-auto bg-white border border-zinc-200 rounded-2xl shadow-sm">
                    {/* Week days header */}
                    <div className="grid grid-cols-7 gap-px bg-zinc-200 sticky top-0 z-10">
                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, idx) => (
                            <div key={day} className={`bg-zinc-100 p-3 text-center font-bold text-sm text-zinc-700 ${idx >= 5 ? 'bg-zinc-200' : ''}`}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-px bg-zinc-200">
                        {monthDays.map((day, idx) => {
                            const dayAppointments = monthAppointments.filter((appt) =>
                                isSameDay(parseISO(appt.date), day)
                            );
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isToday = isSameDay(day, new Date());
                            const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                            return (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        setCurrentDate(day);
                                        setViewMode('day');
                                    }}
                                    className={`
                                        min-h-[120px] bg-white p-2 cursor-pointer transition-all
                                        ${!isCurrentMonth && 'opacity-30 bg-zinc-50'}
                                        ${isToday && 'ring-2 ring-inset ring-rose-500'}
                                        ${isWeekend && isCurrentMonth && 'bg-zinc-50/50'}
                                        hover:bg-rose-50 hover:shadow-md hover:z-10
                                    `}
                                >
                                    <div className={`font-bold text-sm mb-2 ${isToday ? 'text-rose-600' : 'text-zinc-700'}`}>
                                        {format(day, 'd')}
                                    </div>

                                    {/* Show client names */}
                                    <div className="space-y-1">
                                        {dayAppointments.slice(0, 3).map((appt) => (
                                            <div
                                                key={appt.id}
                                                className="text-xs bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded truncate font-medium"
                                                title={`${appt.client.name} - ${appt.service.name}`}
                                            >
                                                {appt.client.name}
                                            </div>
                                        ))}
                                        {dayAppointments.length > 3 && (
                                            <div className="text-xs text-zinc-500 font-bold">
                                                +{dayAppointments.length - 3} mais
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Day View (existing timeline) */}
            {viewMode === 'day' && (
                <div className="flex-1 overflow-y-auto bg-white border border-zinc-200 rounded-2xl relative shadow-sm pb-24">
                    {hours.map(hour => (
                        <div key={hour} className="flex border-b border-zinc-100 min-h-[100px] group hover:bg-zinc-50 transition-colors">
                            {/* Time Column */}
                            <div className="w-20 border-r border-zinc-100 flex items-start justify-center pt-4 text-zinc-400 font-bold text-sm bg-zinc-50/50">
                                {hour}:00
                            </div>

                            <div className="flex-1 relative p-1">
                                {/* Empty State / Add Slot helper */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity z-0"
                                    onClick={() => {
                                        setEditingAppointment(null);
                                        const dateWithTime = new Date(currentDate);
                                        dateWithTime.setHours(hour, 0, 0, 0);
                                        setCurrentDate(dateWithTime);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <span className="text-zinc-400 text-xs font-bold">+ Adicionar em {hour}:00</span>
                                </div>

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
                                                className={`mb-1 p-3 border-l-4 rounded-r-lg transition-colors cursor-pointer shadow-sm relative z-20 ${bgClass}`}
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
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <NewAppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    if (viewMode === 'day') {
                        fetchDayAppointments();
                    } else {
                        fetchMonthAppointments();
                    }
                }}
                preselectedDate={currentDate}
                appointmentToEdit={editingAppointment}
            />
        </div>
    );
}
