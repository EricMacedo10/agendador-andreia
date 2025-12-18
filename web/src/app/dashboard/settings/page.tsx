
import { getSettings } from "./actions"
import { SettingsForm } from "./SettingsForm"
import { ScheduleSettingsForm } from "./ScheduleSettingsForm"
import { WorkingHours } from "@/lib/availability"

export default async function SettingsPage() {
    const settings = await getSettings()
    const workingHours = settings?.workingHours as WorkingHours | null

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-zinc-900 mb-8">Configurações</h1>

            <div className="space-y-6">
                <SettingsForm initialEnabled={!!settings?.onlineBookingEnabled} />
                <ScheduleSettingsForm initialSchedule={workingHours} />
            </div>
        </div>
    )
}
