"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarX, Plus, Trash2, X, Clock, CalendarIcon, AlertTriangle } from "lucide-react";

type DayBlock = {
    id: string;
    startDate: string;
    endDate: string;
    blockType: 'FULL_DAY' | 'PARTIAL';
    startTime?: string;
    endTime?: string;
    reason?: string;
    createdAt: string;
};

type ConflictWarning = {
    date: string;
    time: string;
    clientName: string;
};

export default function BlocksPage() {
    const [blocks, setBlocks] = useState<DayBlock[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBlocks();
    }, []);

    const fetchBlocks = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/blocks');
            const data = await res.json();
            setBlocks(data);
        } catch (error) {
            console.error("Failed to fetch blocks:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteBlock = async (id: string) => {
        console.log('🟢 HANDLER START! ID:', id);
        console.log('🔵 Making DELETE request...');

        try {
            const res = await fetch(`/api/blocks/${id}`, { method: 'DELETE' });
            console.log('📡 Response:', res.status, res.ok);

            if (res.ok) {
                const data = await res.json();
                console.log('✅ Success! Data:', data);
                await fetchBlocks();
                console.log('🎉 List refreshed!');
            } else {
                const error = await res.json();
                console.error('❌ Error:', error);
                alert(`Erro: ${error.error}`);
            }
        } catch (error) {
            console.error("💥 Exception:", error);
            alert("Erro ao conectar");
        }
    };

    // Filter active/future blocks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeBlocks = blocks.filter(b => new Date(b.endDate) >= today);
    const pastBlocks = blocks.filter(b => new Date(b.endDate) < today);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                        <CalendarX className="text-rose-500" size={28} />
                        Bloqueio de Dias
                    </h1>
                    <p className="text-zinc-600 mt-1">Gerencie dias e horários bloqueados para agendamentos</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-rose-200"
                >
                    <Plus size={20} />
                    Novo Bloqueio
                </button>
            </div>

            {/* Active Blocks List */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 mb-4">Bloqueios Ativos e Futuros</h2>
                {isLoading ? (
                    <p className="text-zinc-500 text-center py-8">Carregando...</p>
                ) : activeBlocks.length === 0 ? (
                    <p className="text-zinc-500 text-center py-8">Nenhum bloqueio ativo no momento</p>
                ) : (
                    <div className="space-y-3">
                        {activeBlocks.map(block => (
                            <BlockCard key={block.id} block={block} onDelete={handleDeleteBlock} />
                        ))}
                    </div>
                )}
            </div>

            {/* Past Blocks (Collapsible) */}
            {pastBlocks.length > 0 && (
                <details className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6">
                    <summary className="text-sm font-bold text-zinc-600 cursor-pointer hover:text-zinc-900">
                        Bloqueios Passados ({pastBlocks.length})
                    </summary>
                    <div className="space-y-3 mt-4">
                        {pastBlocks.map(block => (
                            <BlockCard key={block.id} block={block} onDelete={handleDeleteBlock} isPast />
                        ))}
                    </div>
                </details>
            )}

            {/* Modal */}
            {isModalOpen && (
                <NewBlockModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        fetchBlocks();
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}

// Block Card Component
function BlockCard({ block, onDelete, isPast = false }: { block: DayBlock; onDelete: (id: string) => void; isPast?: boolean }) {
    // Use date strings directly to avoid timezone conversion
    const isSameDay = block.startDate === block.endDate;

    const formatDateString = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    };

    const dateDisplay = isSameDay
        ? format(formatDateString(block.startDate), "dd 'de' MMMM", { locale: ptBR })
        : `${format(formatDateString(block.startDate), "dd/MM", { locale: ptBR })} a ${format(formatDateString(block.endDate), "dd/MM/yy", { locale: ptBR })}`;

    return (
        <div className={`flex items-center justify-between p-4 rounded-xl border ${isPast ? 'bg-zinc-50 border-zinc-200 opacity-60' : 'bg-white border-zinc-300'
            }`}>
            <div className="flex items-center gap-4 flex-1">
                <div className="text-3xl">
                    {block.blockType === 'FULL_DAY' ? '🚫' : '⏰'}
                </div>
                <div>
                    <h3 className="font-bold text-zinc-900">{dateDisplay}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${block.blockType === 'FULL_DAY'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {block.blockType === 'FULL_DAY' ? 'Dia Inteiro' : 'Período Parcial'}
                        </span>
                        {block.blockType === 'PARTIAL' && (
                            <span className="text-sm text-zinc-600">
                                {block.startTime} - {block.endTime}
                            </span>
                        )}
                    </div>
                    {block.reason && (
                        <p className="text-sm text-zinc-600 mt-1">Motivo: {block.reason}</p>
                    )}
                </div>
            </div>
            {!isPast && (
                <button
                    type="button"
                    onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        console.log('🔴 BUTTON CLICK! Calling onDelete for:', block.id);
                        await onDelete(block.id);
                        console.log('🔴 onDelete returned');
                    }}
                    className="bg-red-100 text-red-600 hover:bg-red-200 font-bold p-3 rounded-xl transition-colors flex-shrink-0 z-10"
                    title="Excluir Bloqueio"
                    aria-label="Excluir bloqueio"
                >
                    <Trash2 size={18} />
                </button>
            )}
        </div>
    );
}

// New Block Modal Component
function NewBlockModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        blockType: 'FULL_DAY' as 'FULL_DAY' | 'PARTIAL',
        startTime: '09:00',
        endTime: '18:00',
        reason: ''
    });

    const [conflicts, setConflicts] = useState<ConflictWarning[]>([]);
    const [showConflictWarning, setShowConflictWarning] = useState(false);

    const handleSubmit = async (e: React.FormEvent, force = false) => {
        e.preventDefault();

        try {
            const url = force ? '/api/blocks?force=true' : '/api/blocks';
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.warning && data.conflicts) {
                // Show conflict warning
                setConflicts(data.conflicts);
                setShowConflictWarning(true);
            } else if (res.ok) {
                // Success!
                onSuccess();
            } else {
                alert(`Erro: ${data.error || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error("Failed to create block:", error);
            alert("Erro ao conectar com o servidor");
        }
    };

    const confirmBlock = (e: React.FormEvent) => {
        handleSubmit(e, true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md p-6 shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-zinc-900">
                        {showConflictWarning ? '⚠️ Conflitos Detectados' : 'Novo Bloqueio'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-rose-600 bg-zinc-100 rounded-full p-2 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Conflict Warning */}
                {showConflictWarning ? (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
                                <div>
                                    <p className="font-bold text-yellow-900 mb-2">Existem agendamentos confirmados neste período:</p>
                                    <ul className="space-y-1 text-sm text-yellow-800">
                                        {conflicts.map((c, i) => (
                                            <li key={i}>• {c.date} às {c.time} - {c.clientName}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-zinc-600">
                            Você precisará cancelar estes agendamentos manualmente. Deseja continuar?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowConflictWarning(false);
                                    setConflicts([]);
                                }}
                                className="flex-1 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 font-bold py-3 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmBlock}
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Bloquear Mesmo Assim
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Form */
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-zinc-600 font-bold mb-1 flex items-center gap-2">
                                    <CalendarIcon size={16} className="text-rose-500" /> Data Início
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-black font-bold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                    value={formData.startDate}
                                    onChange={(e) => {
                                        setFormData({ ...formData, startDate: e.target.value });
                                        // Auto-fill endDate if empty
                                        if (!formData.endDate) {
                                            setFormData(prev => ({ ...prev, endDate: e.target.value }));
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-600 font-bold mb-1 flex items-center gap-2">
                                    <CalendarIcon size={16} className="text-rose-500" /> Data Fim
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-black font-bold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Block Type Toggle */}
                        <div>
                            <label className="block text-sm text-zinc-600 font-bold mb-2">Tipo de Bloqueio</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, blockType: 'FULL_DAY' })}
                                    className={`p-3 rounded-lg text-sm font-bold border transition-colors ${formData.blockType === 'FULL_DAY'
                                        ? 'bg-red-600 text-white border-red-600'
                                        : 'bg-white text-red-800 border-red-200 hover:bg-red-50'
                                        }`}
                                >
                                    🚫 Dia Inteiro
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, blockType: 'PARTIAL' })}
                                    className={`p-3 rounded-lg text-sm font-bold border transition-colors ${formData.blockType === 'PARTIAL'
                                        ? 'bg-yellow-600 text-white border-yellow-600'
                                        : 'bg-white text-yellow-800 border-yellow-200 hover:bg-yellow-50'
                                        }`}
                                >
                                    ⏰ Período
                                </button>
                            </div>
                        </div>

                        {/* Time Range (for PARTIAL only) */}
                        {formData.blockType === 'PARTIAL' && (
                            <div className="grid grid-cols-2 gap-4 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                <div>
                                    <label className="block text-sm text-yellow-800 font-bold mb-1 flex items-center gap-2">
                                        <Clock size={16} /> Hora Início
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full bg-white border border-yellow-300 rounded-lg p-3 text-black font-bold focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-yellow-800 font-bold mb-1 flex items-center gap-2">
                                        <Clock size={16} /> Hora Fim
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full bg-white border border-yellow-300 rounded-lg p-3 text-black font-bold focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Reason (optional) */}
                        <div>
                            <label className="block text-sm text-zinc-600 font-bold mb-1">Motivo (opcional)</label>
                            <input
                                type="text"
                                placeholder="Ex: Férias, Feriado, Compromisso pessoal..."
                                className="w-full bg-white border border-zinc-300 rounded-lg p-3 text-black focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 font-bold py-4 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-rose-200"
                            >
                                Confirmar Bloqueio
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
