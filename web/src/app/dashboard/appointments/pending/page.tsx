"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, CheckCircle, DollarSign, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface PendingAppointment {
    id: string;
    date: Date;
    client: {
        name: string;
        phone: string;
    };
    service: {
        name: string;
        price: number;
    };
}

export default function PendingAppointmentsPage() {
    const [appointments, setAppointments] = useState<PendingAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchPendingAppointments();
    }, []);

    const fetchPendingAppointments = async () => {
        try {
            const res = await fetch("/api/appointments/pending");
            const data = await res.json();
            setAppointments(data.appointments || []);
        } catch (error) {
            console.error("Error fetching pending appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewAppointment = (appointmentId: string) => {
        router.push(`/dashboard/schedule?appointmentId=${appointmentId}`);
    };

    if (loading) {
        return (
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-24 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-orange-100 p-2 rounded-lg">
                            <AlertTriangle className="text-orange-600" size={24} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Atendimentos Pendentes
                        </h1>
                    </div>
                    <p className="text-gray-600 ml-14">
                        Finalize o pagamento destes atendimentos para manter seu controle financeiro em dia.
                    </p>
                </div>

                {/* Appointments List */}
                {appointments.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Tudo em dia! 🎉
                        </h3>
                        <p className="text-gray-600">
                            Não há atendimentos pendentes de finalização.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleViewAppointment(appointment.id)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Date & Time */}
                                    <div className="flex items-center gap-3 min-w-[180px]">
                                        <div className="bg-orange-100 p-2 rounded-lg">
                                            <Calendar className="text-orange-600" size={20} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {format(new Date(appointment.date), "dd/MM/yyyy", { locale: ptBR })}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {format(new Date(appointment.date), "HH:mm", { locale: ptBR })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Client & Service */}
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900 mb-1">
                                            {appointment.client.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {appointment.service.name}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {appointment.client.phone}
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                                        <DollarSign className="text-green-600" size={20} />
                                        <span className="font-bold text-lg text-gray-900">
                                            R$ {appointment.service.price.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action hint */}
                                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                                    Clique para finalizar o pagamento
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary */}
                {appointments.length > 0 && (
                    <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="text-orange-600" size={20} />
                                <span className="font-semibold text-orange-900">
                                    Total de pendências:
                                </span>
                            </div>
                            <span className="text-2xl font-bold text-orange-900">
                                {appointments.length}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
