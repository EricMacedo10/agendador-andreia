"use client";

import { createAppointment } from "./actions";
import { useEffect, useState } from "react";
import { BUSINESS_INFO } from "@/lib/constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, ChevronRight, Calendar, Clock, User, ArrowLeft } from "lucide-react";

type Service = {
    id: string;
    name: string;
    price: number;
    duration: number;
    visible: boolean;
    imageUrl?: string;
};

type Step = "services" | "datetime" | "info" | "review";

export default function BookingPage() {
    const [loading, setLoading] = useState(true);
    const [bookingEnabled, setBookingEnabled] = useState(false);
    const [services, setServices] = useState<Service[]>([]);

    const [step, setStep] = useState<Step>("services");
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [clientInfo, setClientInfo] = useState({ name: "", phone: "" });

    useEffect(() => {
        // Parallel fetch
        Promise.all([
            fetch("/api/settings", { cache: "no-store" }).then(r => r.json()),
            fetch("/api/services?public=true").then(r => r.json())
        ]).then(([settingsData, servicesData]) => {
            // Temporary Force Close for internal testing phase
            setBookingEnabled(false);
            // setBookingEnabled(settingsData.onlineBookingEnabled);
            setServices(servicesData);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (selectedService && selectedDate) {
            setLoadingSlots(true);
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            fetch(`/api/slots?date=${dateStr}&serviceId=${selectedService.id}`)
                .then(r => r.json())
                .then(data => {
                    setAvailableSlots(data);
                    setLoadingSlots(false);
                })
                .catch(() => setLoadingSlots(false));
        }
    }, [selectedService, selectedDate]);

    if (loading) {
        return (
            <div className="h-screen bg-black flex flex-col items-center justify-center text-yellow-500">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
                <p className="text-zinc-400">Carregando...</p>
            </div>
        );
    }

    if (!bookingEnabled) {
        return (
            <div className="h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-bold text-yellow-500 mb-4">Agendamento Indisponível</h1>
                <p className="text-zinc-400 max-w-md">
                    O agendamento online está temporariamente fechado. Por favor, entre em contato diretamente pelo WhatsApp para verificar disponibilidade.
                </p>
                <a
                    href={`https://wa.me/${BUSINESS_INFO.whatsapp}`}
                    className="mt-8 bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-500 transition-colors"
                >
                    Falar no WhatsApp
                </a>
            </div>
        );
    }

    const goNext = () => {
        if (step === "services") setStep("datetime");
        else if (step === "datetime") setStep("info");
        else if (step === "info") setStep("review");
    };

    const goBack = () => {
        if (step === "datetime") setStep("services");
        else if (step === "info") setStep("datetime");
        else if (step === "review") setStep("info");
    };

    const finishBooking = async () => {
        if (!selectedService || !selectedDate || !selectedTime) return;

        setLoading(true); // Reuse loading state or add new one
        const dateStr = format(selectedDate, "yyyy-MM-dd");

        try {
            // Save to DB
            await createAppointment({
                serviceId: selectedService.id,
                dateStr: dateStr,
                timeStr: selectedTime,
                clientName: clientInfo.name,
                clientPhone: clientInfo.phone
            });

            const dateDisplay = format(selectedDate, "dd/MM/yyyy", { locale: ptBR });
            const message = `Olá ${BUSINESS_INFO.name}, sou *${clientInfo.name}*.\n\nGostaria de confirmar um agendamento:\n\n*Serviço:* ${selectedService.name}\n*Data:* ${dateDisplay} às ${selectedTime}\n*Valor:* R$ ${selectedService.price}\n\nAguardo confirmação!`;

            const encodedMessage = encodeURIComponent(message);
            window.location.href = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodedMessage}`;
        } catch (error) {
            console.error(error);
            alert("Erro ao agendar. Tente novamente.");
            setLoading(false);
        }
    };

    // --- Components for Steps ---

    const ServiceSelection = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Escolha o Serviço</h2>
            {services.length === 0 ? <p className="text-zinc-500">Nenhum serviço disponível.</p> : services.map(s => (
                <div
                    key={s.id}
                    onClick={() => { setSelectedService(s); setStep("datetime"); }}
                    className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl active:bg-zinc-800 cursor-pointer flex justify-between items-center transition-colors hover:border-yellow-900/50"
                >
                    <div className="flex items-center gap-4">
                        {s.imageUrl && (
                            <img
                                src={s.imageUrl}
                                alt={s.name}
                                className="w-16 h-16 rounded-lg object-cover border border-zinc-700"
                            />
                        )}
                        <div>
                            <h3 className="text-white font-medium">{s.name}</h3>
                            <p className="text-zinc-400 text-sm">{s.duration} min • R$ {s.price}</p>
                        </div>
                    </div>
                    <ChevronRight className="text-zinc-600" />
                </div>
            ))}
        </div>
    );

    const DateTimeSelection = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Data e Hora</h2>

            {/* Date */}
            <div>
                <label className="block text-zinc-400 text-sm mb-2">Data</label>
                <input
                    type="date"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white appearance-none"
                    value={format(selectedDate || new Date(), "yyyy-MM-dd")}
                    onChange={(e) => {
                        const date = new Date(e.target.value + 'T12:00:00'); // T12:00 to avoid timezone shift
                        setSelectedDate(date);
                        setSelectedTime("");
                    }}
                />
            </div>

            {/* Time */}
            <div>
                <label className="block text-zinc-400 text-sm mb-2">Horários Disponíveis</label>
                {loadingSlots ? (
                    <div className="py-4 text-center text-zinc-500">Carregando horários...</div>
                ) : availableSlots.length === 0 ? (
                    <div className="py-4 text-center text-red-400 border border-red-900/30 bg-red-900/10 rounded-lg">
                        Nenhum horário disponível nesta data.
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-2">
                        {availableSlots.map(time => (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`py-2 rounded-lg text-sm font-medium border ${selectedTime === time ? 'bg-yellow-600 border-yellow-600 text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'}`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-zinc-800 flex justify-between items-center">
                <div className="text-white font-medium">
                    {selectedTime ? `${format(selectedDate!, "dd/MM")} às ${selectedTime}` : "Selecione um horário"}
                </div>
                <button
                    disabled={!selectedTime}
                    onClick={goNext}
                    className="bg-white text-black px-6 py-3 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Próximo
                </button>
            </div>
            <div className="h-20"></div> {/* Spacer for fixed footer */}
        </div>
    );

    const InfoSelection = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Seus Dados</h2>
            <div>
                <label className="block text-zinc-400 text-sm mb-2">Nome Completo</label>
                <input
                    type="text"
                    placeholder="Ex: Maria Silva"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-zinc-400 text-sm mb-2">Seu WhatsApp</label>
                <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:outline-none"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                />
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-zinc-800 flex justify-end">
                <button
                    disabled={!clientInfo.name || !clientInfo.phone}
                    onClick={goNext}
                    className="bg-white text-black px-6 py-3 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Revisar
                </button>
            </div>
            <div className="h-20"></div>
        </div>
    );

    const ReviewStep = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Confirmar Agendamento</h2>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                    <div className="bg-zinc-800 p-2 rounded-lg text-yellow-500"><Calendar size={20} /></div>
                    <div>
                        <p className="text-sm text-zinc-400">Data e Hora</p>
                        <p className="text-white font-medium">{format(selectedDate!, "dd 'de' MMMM", { locale: ptBR })} - {selectedTime}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="bg-zinc-800 p-2 rounded-lg text-yellow-500"><User size={20} /></div>
                    <div>
                        <p className="text-sm text-zinc-400">Profissional</p>
                        <p className="text-white font-medium">{BUSINESS_INFO.name}</p>
                    </div>
                </div>
                <div className="border-t border-zinc-800 my-2"></div>
                <div className="flex justify-between items-center text-lg">
                    <span className="text-zinc-300">{selectedService?.name}</span>
                    <span className="text-yellow-500 font-bold">R$ {selectedService?.price}</span>
                </div>
            </div>

            <p className="text-xs text-zinc-500 text-center px-4">
                Ao confirmar, você será redirecionado para o WhatsApp para enviar os detalhes do agendamento.
            </p>

            <button
                onClick={finishBooking}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-6 h-6 filter invert" />
                Confirmar no WhatsApp
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            {/* Header */}
            <div className="p-4 flex items-center gap-4 border-b border-zinc-900 sticky top-0 bg-black/90 backdrop-blur-md z-10">
                {step !== "services" && (
                    <button onClick={goBack} className="p-2 -ml-2 text-zinc-400 hover:text-white">
                        <ArrowLeft />
                    </button>
                )}
                <h1 className="font-bold text-lg">{step === "services" ? "Agendar Horário" : "Voltar"}</h1>
            </div>

            {/* Content */}
            <div className="p-4 max-w-md mx-auto">
                {step === "services" && <ServiceSelection />}
                {step === "datetime" && <DateTimeSelection />}
                {step === "info" && <InfoSelection />}
                {step === "review" && <ReviewStep />}
            </div>
        </div>
    );
}
