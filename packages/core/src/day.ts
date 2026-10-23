import type { Clock } from "./clock";
import { instantAt, wallTime } from "./zone";

/** A calendar date, `YYYY-MM-DD`. Sorts and compares as a string. */
export type DayKey = string & { readonly __brand: "DayKey" };

/** A day runs 04:00 to 04:00, so writing at 1am still belongs to the day being lived. */
export const DAY_STARTS_AT_HOUR = 4;

const DAY_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

function keyOf(utc: Date): DayKey {
  return utc.toISOString().slice(0, 10) as DayKey;
}

function dayUtc(day: DayKey) {
  const [year, month, date] = day.split("-").map(Number);
  return Date.UTC(year ?? 0, (month ?? 1) - 1, date ?? 1);
}

/** A day key from text, or null unless it names a real date like `2026-02-28`. */
export function parseDayKey(text: string): DayKey | null {
  const match = DAY_KEY.exec(text);
  if (!match) {
    return null;
  }
  const [, year, month, date] = match.map(Number);
  const utc = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, date ?? 1));
  return utc.getUTCFullYear() === year &&
    utc.getUTCMonth() + 1 === month &&
    utc.getUTCDate() === date
    ? (text as DayKey)
    : null;
}

/** The day `count` days after `day`; negative counts go back. */
export function addDays(day: DayKey, count: number): DayKey {
  return keyOf(new Date(dayUtc(day) + count * DAY_MS));
}

/**
 * The day being lived at `instant` in `zone`. It turns at 04:00 on the wall
 * clock, so a jump for summer time never moves the boundary.
 */
export function dayOf(instant: Date, zone: string): DayKey {
  const wall = wallTime(instant, zone);
  const date = keyOf(new Date(Date.UTC(wall.year, wall.month - 1, wall.day)));
  return wall.hour < DAY_STARTS_AT_HOUR ? addDays(date, -1) : date;
}

/** Today's day, in the device's current zone. */
export function today(clock: Clock): DayKey {
  return dayOf(clock.now(), clock.timeZone());
}

/** The moment `day` ends in `zone`, when it seals: 04:00 on the next date. */
export function dayEnd(day: DayKey, zone: string): Date {
  const next = new Date(dayUtc(addDays(day, 1)));
  return instantAt(
    {
      day: next.getUTCDate(),
      hour: DAY_STARTS_AT_HOUR,
      minute: 0,
      month: next.getUTCMonth() + 1,
      second: 0,
      year: next.getUTCFullYear(),
    },
    zone
  );
}

/** Where a day lives in the journal, as path segments: `2026/10/21/2026-10-21.md`. */
export function dayPath(day: DayKey): [string, string, string, string] {
  const [year = "", month = "", date = ""] = day.split("-");
  return [year, month, date, `${day}.md`];
}
