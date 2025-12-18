'use client'

import { useState } from 'react'
import { toggleBookingAvailability } from './actions'

export function SettingsForm({ initialEnabled }: { initialEnabled: boolean }) {
    const [enabled, setEnabled] = useState(initialEnabled)
    const [pending, setPending] = useState(false)

    async function handleToggle() {
        setPending(true)
        try {
            await toggleBookingAvailability()
            setEnabled(!enabled)
        } catch (error) {
            console.error(error)
            alert("Erro ao atualizar configurações")
        } finally {
            setPending(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-zinc-900">Agendamento Online</h2>
                    <p className="text-sm text-zinc-500">
                        Quando desativado, os clientes verão uma mensagem para entrar em contato via WhatsApp.
                    </p>
                </div>

                <button
                    onClick={handleToggle}
                    disabled={pending}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-zinc-200'
                        }`}
                >
                    <span
                        className={`${enabled ? 'translate-x-7' : 'translate-x-1'
                            } inline-block h-6 w-6 transform rounded-full bg-white transition-transform`}
                    />
                </button>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-100">
                <p className="text-xs text-zinc-400">Status atual: <span className={enabled ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{enabled ? "ATIVO" : "PAUSADO"}</span></p>
            </div>
        </div>
    )
}
