import { addDays, DAY_STARTS_AT_HOUR, type DayKey, dayOf } from "./day";
import { instantAt } from "./zone";

/** How late a reminder may still come, as when the computer wakes after its time. */
export const REMINDER_GRACE_MS = 2 * 60 * 60 * 1000;

/**
 * When `day`'s reminder is due: `time` (`HH:MM`) on the wall clock in `zone`. A
 * time before 4am still belongs to the day, so it falls on the next date.
 */
export function reminderAt(day: DayKey, time: string, zone: string): Date {
  const [hour = 0, minute = 0] = time.split(":").map(Number);
  const date = hour < DAY_STARTS_AT_HOUR ? addDays(day, 1) : day;
  const [year = 0, month = 1, dayOfMonth = 1] = date.split("-").map(Number);
  return instantAt(
    { day: dayOfMonth, hour, minute, month, second: 0, year },
    zone
  );
}

/**
 * The next reminder at `now`: today's, while it's ahead or only a little late
 * and hasn't been given, otherwise tomorrow's. `at` may be past, meaning now.
 */
export function nextReminder({
  now,
  zone,
  time,
  remindedOn,
}: {
  now: Date;
  zone: string;
  time: string;
  /** The day a reminder was last given, so a day gets one at most. */
  remindedOn: DayKey | null;
}): { day: DayKey; at: Date } {
  const day = dayOf(now, zone);
  const at = reminderAt(day, time, zone);
  if (remindedOn !== day && now.getTime() < at.getTime() + REMINDER_GRACE_MS) {
    return { at, day };
  }
  const tomorrow = addDays(day, 1);
  return { at: reminderAt(tomorrow, time, zone), day: tomorrow };
}
