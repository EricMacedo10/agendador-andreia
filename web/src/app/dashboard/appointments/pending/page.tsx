"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, AlertCircle } from "lucide-react";
import { NewAppointmentModal } from "@/components/new-appointment-modal";

type Appointment = {
    id: string;
    date: string;
    status: string;
    client: { name: string };
    service: { name: string; duration: number };
    durationMinutes?: number;
};

export default function PendingAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPendingAppointments();
    }, []);

    const fetchPendingAppointments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/appointments?t=${new Date().getTime()}&status=PENDING`);
            const allAppointments = await res.json();

            // Filter locally for now if API doesn't support status filter perfectly yet
            // Assuming 'COMPLETED' is the status for finished appointments
            const pending = allAppointments.filter((appt: Appointment) => appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED');

            // Sort by date (oldest first)
            pending.sort((a: Appointment, b: Appointment) => new Date(a.date).getTime() - new Date(b.date).getTime());

            setAppointments(pending);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setIsModalOpen(true);
    };

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        fetchPendingAppointments(); // Refresh list
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8">
            <div className="flex items-center gap-2">
                <AlertCircle className="h-8 w-8 text-rose-600" />
                <h1 className="text-3xl font-bold text-gray-900">Atendimentos Pendentes</h1>
            </div>

            <p className="text-gray-600">
                Lista de atendimentos que ainda não foram finalizados financeiramente.
            </p>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-600 border-t-transparent" />
                </div>
            ) : appointments.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
                    <p>Nenhum atendimento pendente! 🎉</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {appointments.map((appt) => (
                        <div key={appt.id} className="rounded-lg border border-l-4 border-gray-200 border-l-rose-500 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                            <div className="mb-2 flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{appt.client.name}</h3>
                                    <p className="text-sm text-gray-500">{appt.service.name}</p>
                                </div>
                                <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                                    Pendente
                                </span>
                            </div>

                            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                {format(parseISO(appt.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                            </div>

                            <button
                                onClick={() => handleEdit(appt)}
                                className="w-full rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 active:scale-95 transition-transform"
                            >
                                Finalizar / Editar
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <NewAppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleModalSuccess}
                appointmentToEdit={editingAppointment || undefined}
                preselectedDate={new Date()}
            />
        </div>
    );
}
