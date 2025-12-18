'use client'

import { useState } from 'react'
import { saveScheduleSettings } from './actions'
import { WorkingHours, DEFAULT_WORKING_HOURS } from '@/lib/availability'

const WEEKDAYS_LABELS: Record<string, string> = {
    monday: "Segunda",
    tuesday: "Terça",
    wednesday: "Quarta",
    thursday: "Quinta",
    friday: "Sexta",
    saturday: "Sábado",
    sunday: "Domingo"
}

const ORDERED_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

export function ScheduleSettingsForm({ initialSchedule }: { initialSchedule: WorkingHours | null }) {
    const [schedule, setSchedule] = useState<WorkingHours>(initialSchedule || DEFAULT_WORKING_HOURS)
    const [saving, setSaving] = useState(false)

    function handleChange(day: string, field: "start" | "end", value: string) {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }))
    }

    function handleToggle(day: string) {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], isOpen: !prev[day].isOpen }
        }))
    }

    async function handleSave() {
        setSaving(true)
        try {
            await saveScheduleSettings(schedule)
            alert("Horários salvos com sucesso!")
        } catch (error) {
            console.error(error)
            alert("Erro ao salvar horários")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Horários de Atendimento</h2>

            <div className="space-y-4">
                {ORDERED_DAYS.map((day) => {
                    const config = schedule[day] || DEFAULT_WORKING_HOURS[day]
                    return (
                        <div key={day} className="flex items-center justify-between py-2 border-b border-zinc-50 last:border-0">
                            <div className="flex items-center gap-4 w-1/3">
                                <input
                                    type="checkbox"
                                    checked={config.isOpen}
                                    onChange={() => handleToggle(day)}
                                    className="w-5 h-5 rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
                                />
                                <span className={config.isOpen ? "font-medium text-zinc-700" : "text-zinc-400"}>
                                    {WEEKDAYS_LABELS[day]}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="time"
                                    disabled={!config.isOpen}
                                    value={config.start}
                                    onChange={(e) => handleChange(day, 'start', e.target.value)}
                                    className="rounded-md border-zinc-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 disabled:opacity-50 disabled:bg-zinc-100"
                                />
                                <span className="text-zinc-400">-</span>
                                <input
                                    type="time"
                                    disabled={!config.isOpen}
                                    value={config.end}
                                    onChange={(e) => handleChange(day, 'end', e.target.value)}
                                    className="rounded-md border-zinc-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 disabled:opacity-50 disabled:bg-zinc-100"
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-rose-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-500 disabled:opacity-50"
                >
                    {saving ? "Salvando..." : "Salvar Horários"}
                </button>
            </div>
        </div>
    )
}
