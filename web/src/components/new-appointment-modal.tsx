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
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);  // ← NEW: Multiple service selection
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        clientId: "",
        serviceId: "",  // DEPRECATED - Now using selectedServices array
        date: preselectedDate ? format(preselectedDate, "yyyy-MM-dd") : "",
        time: "09:00",
        duration: "30",  // DEPRECATED - Calculated from selectedServices
        isCheckout: false,
        price: "",
        paymentMethod: "PIX"
    });

    useEffect(() => {
        if (isOpen) {
            fetchData();
            if (appointmentToEdit) {
                const dt = new Date(appointmentToEdit.date);

                // ← NEW: Load existing services into selectedServices
                if (appointmentToEdit.services && appointmentToEdit.services.length > 0) {
                    const existingServices = appointmentToEdit.services.map((as: any) => ({
                        id: as.serviceId,
                        name: as.service.name,
                        duration: as.service.duration,
                        price: Number(as.priceSnapshot)
                    }));
                    setSelectedServices(existingServices);
                }

                // ← FIX: Use first service for backward compat, calculate total duration and price
                const firstService = appointmentToEdit.services?.[0];
                const totalDuration = appointmentToEdit.totalDurationMinutes ||
                    (appointmentToEdit.services?.reduce((sum, s) => sum + s.service.duration, 0) || 30);
                const totalPrice = appointmentToEdit.paidPrice ||
                    appointmentToEdit.services?.reduce((sum, s) => sum + Number(s.priceSnapshot), 0) || 0;

                setFormData({
                    clientId: appointmentToEdit.clientId,
                    serviceId: firstService?.serviceId || '',  // Use first service for now
                    date: format(dt, "yyyy-MM-dd"),
                    time: format(dt, "HH:mm"),
                    duration: totalDuration.toString(),
                    isCheckout: false,
                    price: appointmentToEdit.paidPrice ? appointmentToEdit.paidPrice.toString() : totalPrice.toString(),
                    paymentMethod: appointmentToEdit.paymentMethod || "PIX"
                });
            } else if (preselectedDate) {
                setSelectedServices([]);  // ← Clear selected services
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
                setSelectedServices([]);  // ← Clear selected services
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

        // Validation: at least 1 service required
        if (!formData.isCheckout && selectedServices.length === 0) {
            alert("Selecione pelo menos 1 serviço");
            return;
        }

        try {
            const dateTime = new Date(`${formData.date}T${formData.time}`);

            const url = appointmentToEdit ? `/api/appointments/${appointmentToEdit.id}` : "/api/appointments";
            const method = appointmentToEdit ? "PUT" : "POST";

            const body: any = {
                clientId: formData.clientId,
                serviceIds: selectedServices.map(s => s.id),  // ← NEW: Array of service IDs
                date: dateTime.toISOString(),
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
                // Reset state
                setSelectedServices([]);
                setFormData({
                    clientId: "",
                    serviceId: "",
                    date: "",
                    time: "09:00",
                    duration: "30",
                    isCheckout: false,
                    price: "",
                    paymentMethod: "PIX"
                });
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm" 
             style={{ height: '100dvh', maxHeight: '100dvh' }}>
            <div className={`bg-white border border-zinc-200 rounded-2xl w-full max-w-md shadow-xl transition-all flex flex-col ${formData.isCheckout ? 'border-emerald-500 ring-2 ring-emerald-100' : ''}`}
                 style={{ 
                   maxHeight: 'calc(100dvh - 2rem)', 
                   height: 'auto' 
                 }}>
                {/* Header - Fixed */}
                <div className="flex justify-between items-center p-6 pb-4 border-b border-zinc-100">
                    <h2 className="text-xl font-bold text-zinc-900">
                        {formData.isCheckout ? "Finalizar Atendimento 💰" : (appointmentToEdit ? "Editar Agendamento" : "Novo Agendamento")}
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-rose-600 bg-zinc-100 rounded-full p-2 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" 
                         style={{ 
                           maxHeight: 'calc(100dvh - 16rem)',
                           paddingBottom: 'env(safe-area-inset-bottom, 1rem)'
                         }}>
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
                                    {clients.sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}

                                </select>
                            </div>

                            {/* SERVICE SELECTION - Multiple Checkboxes */}
                            <div>
                                <label className="block text-sm text-zinc-600 font-bold mb-2 flex items-center gap-2">
                                    <Scissors size={16} className="text-rose-500" /> Serviços *
                                </label>

                                {/* Scrollable checkbox list */}
                                <div className="max-h-48 overflow-y-auto border-2 border-zinc-200 rounded-xl p-3 space-y-2 bg-zinc-50">
                                    {services.map(service => {
                                        const isSelected = selectedServices.some(s => s.id === service.id);

                                        return (
                                            <label
                                                key={service.id}
                                                className={`
                                                    flex items-center justify-between p-3 rounded-lg cursor-pointer
                                                    transition-all border-2
                                                    ${isSelected
                                                        ? 'bg-rose-50 border-rose-500 shadow-md'
                                                        : 'bg-white border-zinc-200 hover:border-rose-300 hover:shadow-sm'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {
                                                            let newServices;
                                                            if (isSelected) {
                                                                newServices = selectedServices.filter(s => s.id !== service.id);
                                                            } else {
                                                                newServices = [...selectedServices, service];
                                                            }
                                                            setSelectedServices(newServices);

                                                            // Recalculate totals
                                                            const totalDuration = newServices.reduce((sum, s) => sum + s.duration, 0);
                                                            const totalPrice = newServices.reduce((sum, s) => sum + Number(s.price), 0);

                                                            setFormData(prev => ({
                                                                ...prev,
                                                                duration: totalDuration.toString(),
                                                                price: totalPrice.toFixed(2) // Ensure proper decimal format
                                                            }));
                                                        }}
                                                        className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-zinc-900">{service.name}</p>
                                                        <p className="text-xs text-zinc-500">
                                                            {service.duration} min • R$ {Number(service.price).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Visual indicator */}
                                                {isSelected && (
                                                    <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>

                                {/* Validation message */}
                                {selectedServices.length === 0 && (
                                    <p className="text-sm text-red-600 mt-1 font-medium">
                                        ⚠️ Selecione pelo menos 1 serviço
                                    </p>
                                )}
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
                    </div>

                    {/* Fixed Button Footer */}
                    <div className="border-t border-zinc-200 p-6 bg-white" 
                         style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
                        <div className="flex gap-3">
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
                    </div>
                </form>
            </div>
        </div>
    );
}
