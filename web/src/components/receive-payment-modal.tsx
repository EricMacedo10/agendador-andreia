'use client';

import { useState } from 'react';
import { DollarSign, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReceivePaymentModal({ clientId, clientName, currentBalance }: { clientId: string, clientName: string, currentBalance: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState(Math.abs(currentBalance).toString());
    const [paymentMethod, setPaymentMethod] = useState('PIX');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}/wallet/payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Number(amount),
                    paymentMethod,
                    description: `Pagamento de dívida em mãos (${paymentMethod})`
                })
            });

            if (res.ok) {
                setIsOpen(false);
                router.refresh();
            } else {
                alert('Erro ao registrar pagamento');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center gap-2"
            >
                <DollarSign size={16} /> Receber Pagamento
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-zinc-200">
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">Receber Pagamento</h2>
                        <p className="text-sm text-zinc-500">{clientName}</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Valor do Pagamento</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">R$</span>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xl font-bold text-zinc-900"
                                placeholder="0,00"
                            />
                        </div>
                        {currentBalance < 0 && (
                            <p className="text-xs text-rose-500 mt-2 font-medium">
                                Esta cliente possui uma dívida de R$ {Math.abs(currentBalance).toFixed(2)}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Forma de Pagamento</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['PIX', 'Dinheiro', 'Cartão', 'Outro'].map((method) => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                                        paymentMethod === method 
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                                        : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                                    }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-zinc-50 flex gap-3">
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="flex-1 px-4 py-3 rounded-xl font-bold text-zinc-600 border border-zinc-200 hover:bg-zinc-100 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isLoading || !amount || Number(amount) <= 0}
                        className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Salvando...' : <><Check size={20} /> Confirmar</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
