/** A time as a wall clock in some zone shows it. `month` is 1-based. */
export interface WallTime {
  day: number;
  hour: number;
  minute: number;
  month: number;
  second: number;
  year: number;
}

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(zone: string) {
  let format = formatters.get(zone);
  if (!format) {
    format = new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      hour: "numeric",
      hourCycle: "h23",
      minute: "numeric",
      month: "numeric",
      second: "numeric",
      timeZone: zone,
      year: "numeric",
    });
    formatters.set(zone, format);
  }
  return format;
}

/** Whether `zone` is an IANA zone this runtime knows, like "Africa/Tunis". */
export function isTimeZone(zone: string) {
  try {
    formatter(zone);
    return true;
  } catch {
    return false;
  }
}

/** The wall clock in `zone` at `instant`. Throws on an unknown zone. */
export function wallTime(instant: Date, zone: string): WallTime {
  const wall: WallTime = {
    day: 0,
    hour: 0,
    minute: 0,
    month: 0,
    second: 0,
    year: 0,
  };
  for (const part of formatter(zone).formatToParts(instant)) {
    if (part.type in wall) {
      wall[part.type as keyof WallTime] = Number(part.value);
    }
  }
  return wall;
}

function wallAsUtc(wall: WallTime) {
  return Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second
  );
}

/** How far `zone` is ahead of UTC at `instant`, in whole minutes. */
export function offsetMinutes(instant: Date, zone: string) {
  const seconds = Math.floor(instant.getTime() / 1000) * 1000;
  return Math.round((wallAsUtc(wallTime(instant, zone)) - seconds) / MINUTE_MS);
}

function sameWall(a: WallTime, b: WallTime) {
  return wallAsUtc(a) === wallAsUtc(b);
}

/**
 * The instant a wall clock in `zone` shows `wall`. When clocks fall back and the
 * time happens twice, the earlier one; when they spring forward over it, the
 * time as far past the jump as `wall` was into it.
 */
export function instantAt(wall: WallTime, zone: string): Date {
  const utc = wallAsUtc(wall);
  // The offsets either side; a zone never changes twice within a day
  const before = offsetMinutes(new Date(utc - DAY_MS), zone);
  const after = offsetMinutes(new Date(utc + DAY_MS), zone);
  const matches = [before, after]
    .map((offset) => new Date(utc - offset * MINUTE_MS))
    .filter((candidate) => sameWall(wallTime(candidate, zone), wall))
    .sort((a, b) => a.getTime() - b.getTime());
  return matches[0] ?? new Date(utc - before * MINUTE_MS);
}

const pad = (value: number, length = 2) =>
  String(Math.abs(value)).padStart(length, "0");

/** ISO 8601 with the zone's offset, as the journal stores times: `2026-10-21T19:02:11+01:00`. */
export function isoWithOffset(instant: Date, zone: string) {
  const wall = wallTime(instant, zone);
  const offset = offsetMinutes(instant, zone);
  const sign = offset < 0 ? "-" : "+";
  const date = `${pad(wall.year, 4)}-${pad(wall.month)}-${pad(wall.day)}`;
  const time = `${pad(wall.hour)}:${pad(wall.minute)}:${pad(wall.second)}`;
  const zoneOffset = `${sign}${pad(Math.trunc(offset / 60))}:${pad(offset % 60)}`;
  return `${date}T${time}${zoneOffset}`;
}
