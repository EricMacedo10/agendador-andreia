"use client";

import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Clock, User, Scissors, Trash2 } from "lucide-react";
import { format } from "date-fns";

type Client = { id: string; name: string };
type Service = { id: string; name: string; duration: number; price: number };

interface NewAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    preselectedDate?: Date;
    appointmentToEdit?: any;
}

export function NewAppointmentModal({ isOpen, onClose, onSuccess, preselectedDate, appointmentToEdit }: NewAppointmentModalProps) {
    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        clientId: "",
        serviceId: "",
        date: preselectedDate ? format(preselectedDate, "yyyy-MM-dd") : "",
        time: "09:00",
        duration: "30",
        isCheckout: false,
        price: "",
        paymentMethod: "PIX"
    });

    useEffect(() => {
        if (isOpen) {
            fetchData();
            if (appointmentToEdit) {
                const dt = new Date(appointmentToEdit.date);
                setFormData({
                    clientId: appointmentToEdit.clientId,
                    serviceId: appointmentToEdit.serviceId,
                    date: format(dt, "yyyy-MM-dd"),
                    time: format(dt, "HH:mm"),
                    duration: appointmentToEdit.durationMinutes?.toString() || appointmentToEdit.service.duration.toString(),
                    isCheckout: false,
                    price: appointmentToEdit.paidPrice ? appointmentToEdit.paidPrice.toString() : (appointmentToEdit.service.price ? appointmentToEdit.service.price.toString() : ""),
                    paymentMethod: appointmentToEdit.paymentMethod || "PIX"
                });
            } else if (preselectedDate) {
                setFormData(prev => ({
                    ...prev,
                    clientId: "",
                    serviceId: "",
                    date: format(preselectedDate, "yyyy-MM-dd"),
                    time: format(preselectedDate, "HH:mm"),
                    duration: "30",
                    isCheckout: false,
                    price: "",
                    paymentMethod: "PIX"
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    clientId: "",
                    serviceId: "",
                    duration: "30",
                    isCheckout: false,
                    price: "",
                    paymentMethod: "PIX"
                }));
            }
        }
    }, [isOpen, preselectedDate, appointmentToEdit]);

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sId = e.target.value;
        const service = services.find(s => s.id === sId);
        setFormData(prev => ({
            ...prev,
            serviceId: sId,
            duration: service ? service.duration.toString() : "30",
            price: service ? service.price.toString() : prev.price
        }));
    };

    const fetchData = async () => {
        try {
            const [clientsRes, servicesRes] = await Promise.all([
                fetch("/api/clients"),
                fetch("/api/services")
            ]);
            const clientsData = await clientsRes.json();
            const servicesData = await servicesRes.json();
            setClients(clientsData);
            setServices(servicesData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!appointmentToEdit || !confirm("Tem certeza que deseja excluir esse agendamento?")) return;

        try {
            await fetch(`/api/appointments/${appointmentToEdit.id}`, { method: 'DELETE' });
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dateTime = new Date(`${formData.date}T${formData.time}`);

            const url = appointmentToEdit ? `/api/appointments/${appointmentToEdit.id}` : "/api/appointments";
            const method = appointmentToEdit ? "PUT" : "POST";

            const body: any = {
                clientId: formData.clientId,
                serviceId: formData.serviceId,
                date: dateTime.toISOString(),
                durationMinutes: formData.duration,
            };

            if (formData.isCheckout) {
                body.status = "COMPLETED";
                body.paymentMethod = formData.paymentMethod;
                body.paidPrice = formData.price;
            }

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const err = await res.json();
                alert(`Erro ao agendar: ${err.error || "Erro desconhecido"}`);
                console.error("Server responded with error:", err);
            }
        } catch (error) {
            console.error("Network or logic error:", error);
            alert("Erro ao conectar com o servidor. Tente novamente.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className={`bg-white border border-zinc-200 rounded-2xl w-full max-w-md p-6 shadow-xl transition-all ${formData.isCheckout ? 'border-emerald-500 ring-2 ring-emerald-100' : ''}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-zinc-900">
                        {formData.isCheckout ? "Finalizar Atendimento 💰" : (appointmentToEdit ? "Editar Agendamento" : "Novo Agendamento")}
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-rose-600 bg-zinc-100 rounded-full p-2 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!formData.isCheckout && (
                        <>
                            <div>
                                <label className="block text-sm text-zinc-600 font-bold mb-1 flex items-center gap-2">
                                    <User size={16} className="text-rose-500" /> Cliente
                                </label>
                                <select
                                    required
                                    className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-black font-bold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                >
                                    <option value="">Selecione um cliente...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-600 font-bold mb-1 flex items-center gap-2">
                                    <Scissors size={16} className="text-rose-500" /> Serviço
                                </label>
                                <select
                                    required
                                    className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-black font-bold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                    value={formData.serviceId}
                                    onChange={handleServiceChange}
                                >
                                    <option value="">Selecione um serviço...</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.duration} min - R$ {Number(s.price).toFixed(2)})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-600 font-bold mb-1 flex items-center gap-2">
                                    <Clock size={16} className="text-rose-500" /> Duração (minutos)
                                </label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-black font-bold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-600 font-bold mb-1 flex items-center gap-2">
                                        <CalendarIcon size={16} className="text-rose-500" /> Data
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-black font-bold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-600 font-bold mb-1 flex items-center gap-2">
                                        <Clock size={16} className="text-rose-500" /> Horário
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-black font-bold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {formData.isCheckout && (
                        <div className="bg-emerald-50 p-4 rounded-xl space-y-4 border border-emerald-100 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-center mb-4">
                                <p className="text-emerald-800 text-sm font-medium">Confirme os valores recebidos</p>
                            </div>

                            <div>
                                <label className="block text-sm text-emerald-800 font-bold mb-1">Valor Cobrado (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full bg-white border border-emerald-300 rounded-lg p-3 text-emerald-900 font-bold text-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-emerald-800 font-bold mb-1">Forma de Pagamento</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['PIX', 'CASH', 'CREDIT_CARD', 'DEBIT_CARD'].map((method) => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, paymentMethod: method })}
                                            className={`p-3 rounded-lg text-sm font-bold border transition-colors ${formData.paymentMethod === method
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                                                }`}
                                        >
                                            {method === 'CASH' && '💵 Dinheiro'}
                                            {method === 'PIX' && '💠 PIX'}
                                            {method === 'CREDIT_CARD' && '💳 Crédito'}
                                            {method === 'DEBIT_CARD' && '💳 Débito'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {!formData.isCheckout && (
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isCheckout: true })}
                            className="w-full mb-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 border border-emerald-200"
                        >
                            ✅ Finalizar / Já Realizado
                        </button>
                    )}

                    <div className="flex gap-3 mt-6">
                        {appointmentToEdit && !formData.isCheckout && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="bg-red-100 text-red-600 hover:bg-red-200 font-bold p-4 rounded-xl transition-colors"
                                title="Excluir Agendamento"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}

                        {formData.isCheckout && (
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isCheckout: false })}
                                className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 font-bold p-4 rounded-xl transition-colors"
                            >
                                Voltar
                            </button>
                        )}

                        <button
                            type="submit"
                            className={`flex-1 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg ${formData.isCheckout
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                                }`}
                        >
                            {formData.isCheckout ? "Confirmar Pagamento Assinado" : (appointmentToEdit ? "Salvar Alterações" : "Confirmar Agendamento")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
