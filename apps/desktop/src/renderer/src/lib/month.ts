/** A calendar date as `YYYY-MM-DD`, in local time. Sorts and compares as a string. */
export type DayKey = string;

export interface CalendarDay {
  day: number;
  inMonth: boolean;
  key: DayKey;
}

/** A day runs 04:00 to 04:00, so writing at 1am still belongs to the day being lived. */
const DAY_STARTS_AT_HOUR = 4;

export function dayKey(date: Date): DayKey {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The local date a key names, at midnight. */
export function fromKey(key: DayKey): Date {
  const [year = 0, month = 1, day = 1] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Today's key under the 4am boundary. */
export function todayKey(now: Date): DayKey {
  const shifted = new Date(now);
  shifted.setHours(shifted.getHours() - DAY_STARTS_AT_HOUR);
  return dayKey(shifted);
}

/**
 * The weeks that show a month, Monday first: from the Monday on or before the 1st
 * to the Sunday on or after the last day. `month` is 0-based, as in Date.
 */
export function monthWeeks(year: number, month: number): CalendarDay[][] {
  const first = new Date(year, month, 1);
  // getDay() counts from Sunday; shift so Monday is 0
  const lead = (first.getDay() + 6) % 7;
  const cursor = new Date(year, month, 1 - lead);
  const weeks: CalendarDay[][] = [];

  do {
    const week: CalendarDay[] = [];
    for (let i = 0; i < 7; i += 1) {
      week.push({
        day: cursor.getDate(),
        inMonth: cursor.getMonth() === month,
        key: dayKey(cursor),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  } while (cursor.getMonth() === month);

  return weeks;
}

/** Milliseconds from `now` until the next 4am boundary, when today seals. */
export function msUntilNextBoundary(now: Date) {
  const next = new Date(now);
  next.setHours(DAY_STARTS_AT_HOUR, 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}
