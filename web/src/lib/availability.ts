
import { addMinutes, format, isAfter, isBefore, parse, startOfDay, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"

// Types matching our Schema/Logic
export type WorkingHours = {
    [key: string]: { // "monday", "tuesday", ...
        start: string; // "09:00"
        end: string;   // "18:00"
        isOpen: boolean;
    }
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export const DEFAULT_WORKING_HOURS: WorkingHours = {
    monday: { start: "09:00", end: "18:00", isOpen: true },
    tuesday: { start: "09:00", end: "18:00", isOpen: true },
    wednesday: { start: "09:00", end: "18:00", isOpen: true },
    thursday: { start: "09:00", end: "18:00", isOpen: true },
    friday: { start: "09:00", end: "18:00", isOpen: true },
    saturday: { start: "09:00", end: "14:00", isOpen: true },
    sunday: { start: "09:00", end: "12:00", isOpen: false },
};

/**
 * Generates available slots for a given date, checking working hours and conflicts.
 */
export function getAvailableSlots(
    date: Date,
    workingHours: WorkingHours,
    existingAppointments: { date: Date; durationMinutes: number | null, service: { duration: number } }[],
    serviceDurationMinutes: number
): string[] {
    const dayName = WEEKDAYS[date.getDay()];
    const schedule = workingHours[dayName] || DEFAULT_WORKING_HOURS[dayName];

    if (!schedule || !schedule.isOpen) {
        return [];
    }

    const slots: string[] = [];
    const dateStr = format(date, "yyyy-MM-dd");

    // Parse Start and End times
    let currentTime = parse(`${dateStr} ${schedule.start}`, "yyyy-MM-dd HH:mm", new Date());
    const endTime = parse(`${dateStr} ${schedule.end}`, "yyyy-MM-dd HH:mm", new Date());

    // Generate all potential slots
    while (isBefore(currentTime, endTime)) {
        const slotEnd = addMinutes(currentTime, serviceDurationMinutes);

        // If the slot finishes after closing time, it's invalid
        if (isAfter(slotEnd, endTime)) {
            break;
        }

        // Check conflicts
        const isConflict = existingAppointments.some(appt => {
            const apptStart = new Date(appt.date);
            const duration = appt.durationMinutes || appt.service.duration;
            const apptEnd = addMinutes(apptStart, duration);

            // Check overlap
            // (StartA < EndB) and (EndA > StartB)
            return isBefore(currentTime, apptEnd) && isAfter(slotEnd, apptStart);
        });

        if (!isConflict) {
            slots.push(format(currentTime, "HH:mm"));
        }

        // Increment by 30 mins (or service duration? Standard is usually fixed intervals like 30m or 1h)
        // Let's use 30 min steps for flexibility
        currentTime = addMinutes(currentTime, 30);
    }

    return slots;
}
