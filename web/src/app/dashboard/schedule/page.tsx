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
    services: { service: { name: string; duration: number }; priceSnapshot: number }[];  // ← NEW: Multiple services
    totalDurationMinutes?: number;  // ← NEW: Total duration
};

type DayBlock = {
    id: string;
    startDate: string;
    endDate: string;
    blockType: 'FULL_DAY' | 'PARTIAL';
    startTime?: string;
    endTime?: string;
    reason?: string;
};

export default function SchedulePage() {
    // View mode: 'month' or 'day'
    const [viewMode, setViewMode] = useState<'month' | 'day'>('month');

    // For day view
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [dayBlocks, setDayBlocks] = useState<DayBlock[]>([]);

    // For month view
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([]);
    const [monthDays, setMonthDays] = useState<Date[]>([]);
    const [monthBlocks, setMonthBlocks] = useState<DayBlock[]>([]);

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
            fetchMonthBlocks();
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

            // Also fetch blocks for this day
            await fetchDayBlocks();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDayBlocks = async () => {
        try {
            const dayStr = format(currentDate, 'yyyy-MM-dd');
            const res = await fetch(`/api/blocks?start=${dayStr}&end=${dayStr}`);
            const data = await res.json();
            setDayBlocks(data);
        } catch (error) {
            console.error('Failed to fetch day blocks:', error);
        }
    };

    // Helper to check if a specific hour is blocked
    const isHourBlocked = (hour: number): boolean => {
        const dayStr = format(currentDate, 'yyyy-MM-dd');

        // Find blocks that cover the current date
        const blocksForDay = monthBlocks.filter(b => {
            const blockStart = b.startDate.split('T')[0];
            const blockEnd = b.endDate.split('T')[0];
            return dayStr >= blockStart && dayStr <= blockEnd;
        });

        return blocksForDay.some(block => {
            if (block.blockType === 'FULL_DAY') return true;

            if (block.blockType === 'PARTIAL' && block.startTime && block.endTime) {
                const [blockStartHour, blockStartMin] = block.startTime.split(':').map(Number);
                const [blockEndHour, blockEndMin] = block.endTime.split(':').map(Number);
                const blockStartMinutes = blockStartHour * 60 + blockStartMin;
                const blockEndMinutes = blockEndHour * 60 + blockEndMin;
                const hourMinutes = hour * 60;
                return hourMinutes >= blockStartMinutes && hourMinutes < blockEndMinutes;
            }
            return false;
        });
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

    const fetchMonthBlocks = async () => {
        try {
            const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
            const res = await fetch(`/api/blocks?start=${start}&end=${end}`);
            const data = await res.json();
            setMonthBlocks(data);
        } catch (error) {
            console.error('Failed to fetch blocks:', error);
        }
    };

    // Helper function to check if a day is blocked
    const getDayBlockStatus = (day: Date): 'FULL_DAY' | 'PARTIAL' | null => {
        const dayStr = format(day, 'yyyy-MM-dd');

        const dayBlocks = monthBlocks.filter(b => {
            // Convert block dates to strings for comparison
            const blockStart = b.startDate.split('T')[0]; // Get YYYY-MM-DD part
            const blockEnd = b.endDate.split('T')[0];     // Get YYYY-MM-DD part

            return dayStr >= blockStart && dayStr <= blockEnd;
        });

        if (dayBlocks.length === 0) return null;

        const hasFullDay = dayBlocks.some(b => b.blockType === 'FULL_DAY');
        if (hasFullDay) return 'FULL_DAY';

        return 'PARTIAL';
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

                    {/* Only show new appointment button if day is not fully blocked */}
                    {viewMode === 'day' && getDayBlockStatus(currentDate) === 'FULL_DAY' ? (
                        <div className="bg-red-100 border border-red-300 text-red-700 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 w-full md:w-auto">
                            <span className="text-xl">🚫</span>
                            Dia Bloqueado
                        </div>
                    ) : (
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
                    )}
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
                            const blockStatus = getDayBlockStatus(day);

                            // Get block details for tooltip
                            const dayStr = format(day, 'yyyy-MM-dd');
                            const dayBlocksInfo = monthBlocks.filter(b => {
                                const start = format(new Date(b.startDate), 'yyyy-MM-dd');
                                const end = format(new Date(b.endDate), 'yyyy-MM-dd');
                                return dayStr >= start && dayStr <= end;
                            });

                            return (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        if (!blockStatus) {
                                            setCurrentDate(day);
                                            setViewMode('day');
                                        }
                                    }}
                                    className={`
                                        min-h-[60px] md:min-h-[120px] max-h-[60px] md:max-h-[120px] 
                                        bg-white p-1.5 md:p-2 transition-all overflow-hidden
                                        ${!isCurrentMonth && 'opacity-30 bg-zinc-50'}
                                        ${isToday && 'ring-2 ring-inset ring-rose-500'}
                                        ${isWeekend && isCurrentMonth && 'bg-zinc-50/50'}
                                        ${blockStatus === 'FULL_DAY' && 'bg-red-50 border-2 border-red-200'}
                                        ${blockStatus === 'PARTIAL' && 'bg-yellow-50 border-2 border-yellow-200'}
                                        ${!blockStatus && 'cursor-pointer hover:bg-rose-50 hover:shadow-md hover:z-10'}
                                        ${blockStatus && 'cursor-not-allowed'}
                                    `}
                                    title={blockStatus && dayBlocksInfo.length > 0
                                        ? dayBlocksInfo.map(b =>
                                            `${b.blockType === 'FULL_DAY' ? '🚫 Bloqueado' : '⏰ Parcialmente bloqueado'}${b.startTime ? ` (${b.startTime}-${b.endTime})` : ''}${b.reason ? `: ${b.reason}` : ''}`
                                        ).join('\n')
                                        : undefined
                                    }
                                >
                                    <div className="flex items-center justify-between mb-1 md:mb-2">
                                        <div className={`font-bold text-xs md:text-sm ${isToday ? 'text-rose-600' : 'text-zinc-700'}`}>
                                            {format(day, 'd')}
                                        </div>
                                        {blockStatus && (
                                            <span className="text-base md:text-lg">
                                                {blockStatus === 'FULL_DAY' ? '🚫' : '⏰'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Show client names - max 2 on mobile, 3 on desktop */}
                                    <div className="space-y-0.5 md:space-y-1">
                                        {dayAppointments.slice(0, 2).map((appt) => (
                                            <div
                                                key={appt.id}
                                                className="text-[10px] md:text-xs bg-rose-100 text-rose-900 px-1 md:px-1.5 py-0.5 rounded truncate font-medium"
                                                title={`${appt.client.name} - ${appt.services.map(s => s.service.name).join(', ')}`}
                                            >
                                                {appt.client.name}
                                            </div>
                                        ))}
                                        {/* Show 3rd appointment only on desktop */}
                                        {dayAppointments.length > 2 && (
                                            <>
                                                <div className="hidden md:block text-xs bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded truncate font-medium"
                                                    title={`${dayAppointments[2].client.name} - ${dayAppointments[2].services.map(s => s.service.name).join(', ')}`}
                                                >
                                                    {dayAppointments[2].client.name}
                                                </div>
                                                {dayAppointments.length > 3 && (
                                                    <div className="text-[10px] md:text-xs text-zinc-500 font-bold">
                                                        +{dayAppointments.length - 3} mais
                                                    </div>
                                                )}
                                                {/* Mobile: show "+X mais" for 3+ appointments */}
                                                <div className="md:hidden text-[10px] text-zinc-500 font-bold">
                                                    +{dayAppointments.length - 2} mais
                                                </div>
                                            </>
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
                    {hours.map(hour => {
                        const hourBlocked = isHourBlocked(hour);

                        return (
                            <div key={hour} className={`flex border-b border-zinc-100 min-h-[100px] transition-colors ${hourBlocked ? 'bg-red-50/50' : 'group hover:bg-zinc-50'}`}>
                                {/* Time Column */}
                                <div className={`w-20 border-r border-zinc-100 flex items-start justify-center pt-4 text-sm font-bold bg-zinc-50/50 ${hourBlocked ? 'text-red-400 line-through' : 'text-zinc-400'}`}>
                                    {hour}:00
                                </div>

                                <div className="flex-1 relative p-1">
                                    {/* Blocked indicator */}
                                    {hourBlocked ? (
                                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                            <div className="bg-red-100 border border-red-300 rounded-lg px-4 py-2 flex items-center gap-2">
                                                <span className="text-2xl">🚫</span>
                                                <span className="text-sm font-bold text-red-700">Horário Bloqueado</span>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Empty State / Add Slot helper */
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
                                    )}

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
                                                        <span>{appt.services.map(s => s.service.name).join(', ')}</span>
                                                        <span>{appt.totalDurationMinutes || appt.services.reduce((sum, s) => sum + s.service.duration, 0)} min</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                            </div>
                        )
                    })}
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
