import {
  type FlowerColor,
  type GardenDay,
  isFlower,
} from "@daylily/ui/components/garden";
import { type DayKey, dayKey, fromKey } from "./month";

/** What the garden needs to know about a written day. */
export interface GardenEntry {
  color: FlowerColor;
  hour: number;
  words: number;
}

export type GardenRange = "season" | "year" | "all";

export interface GardenGrid {
  /** One per cell, Monday first, a week per column. */
  cells: GardenDay[];
  columns: number;
  keys: DayKey[];
  /** Where each month starts, as a 0-based column, for the labels above the grid. */
  months: { column: number; date: Date }[];
  todayIndex: number | undefined;
}

const DAYS_IN_WEEK = 7;
/** Columns a month label needs before the next one, so short labels don't collide. */
const MIN_LABEL_GAP = 3;

function mondayOnOrBefore(date: Date) {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % DAYS_IN_WEEK));
  return monday;
}

/** The span a view covers: Season is this month and the two before it. */
export function rangeDates(
  range: GardenRange,
  today: DayKey,
  firstDay: DayKey
): { end: Date; start: Date } {
  const now = fromKey(today);
  if (range === "year") {
    return {
      end: new Date(now.getFullYear(), 11, 31),
      start: new Date(now.getFullYear(), 0, 1),
    };
  }
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  if (range === "season") {
    return { end, start: new Date(now.getFullYear(), now.getMonth() - 2, 1) };
  }
  return { end, start: fromKey(firstDay) };
}

/**
 * Lays days out in weeks from `start` to `end`: flowers for written days, bare soil
 * for the rest up to today, faint dots after it, and blanks to fill the edge weeks.
 */
export function gardenGrid(
  start: Date,
  end: Date,
  today: DayKey,
  entries: ReadonlyMap<DayKey, GardenEntry>
): GardenGrid {
  const first = dayKey(start);
  const last = dayKey(end);
  const cells: GardenDay[] = [];
  const keys: DayKey[] = [];
  const months: GardenGrid["months"] = [];
  let todayIndex: number | undefined;

  const cursor = mondayOnOrBefore(start);
  while (dayKey(cursor) <= last || cells.length % DAYS_IN_WEEK !== 0) {
    const key = dayKey(cursor);
    const entry = entries.get(key);
    const index = cells.length;

    if (key >= first && key <= last && cursor.getDate() === 1) {
      months.push({
        column: Math.floor(index / DAYS_IN_WEEK),
        date: new Date(cursor),
      });
    }
    if (key === today) {
      todayIndex = index;
    }

    if (key < first || key > last) {
      cells.push("blank");
    } else if (key > today) {
      cells.push("upcoming");
    } else if (entry) {
      cells.push({ color: entry.color, words: entry.words });
    } else {
      cells.push(null);
    }
    keys.push(key);
    cursor.setDate(cursor.getDate() + 1);
  }

  // A range that starts mid-month still names its first month, when there's room
  const nextLabel = months[0]?.column ?? Number.POSITIVE_INFINITY;
  if (nextLabel >= MIN_LABEL_GAP) {
    months.unshift({ column: 0, date: new Date(start) });
  }

  return {
    cells,
    columns: cells.length / DAYS_IN_WEEK,
    keys,
    months,
    todayIndex,
  };
}

export interface GardenStats {
  flowers: number;
  /** The month with the most flowers, or null before the first. */
  fullestMonth: Date | null;
  /** The hour writing most often begins, or null before the first flower. */
  usualHour: number | null;
  words: number;
}

/** Totals over the written days in a grid, up to today. */
export function gardenStats(
  grid: GardenGrid,
  entries: ReadonlyMap<DayKey, GardenEntry>
): GardenStats {
  const perMonth = new Map<string, number>();
  const perHour = new Map<number, number>();
  let flowers = 0;
  let words = 0;

  for (const [index, cell] of grid.cells.entries()) {
    const key = grid.keys[index];
    const entry = key ? entries.get(key) : undefined;
    if (!(isFlower(cell) && key && entry)) {
      continue;
    }
    flowers += 1;
    words += entry.words;
    const month = key.slice(0, 7);
    perMonth.set(month, (perMonth.get(month) ?? 0) + 1);
    perHour.set(entry.hour, (perHour.get(entry.hour) ?? 0) + 1);
  }

  const most = <K>(counts: Map<K, number>) =>
    [...counts].reduce<[K, number] | null>(
      (best, pair) => (best === null || pair[1] > best[1] ? pair : best),
      null
    )?.[0] ?? null;

  const fullest = most(perMonth);
  return {
    flowers,
    fullestMonth: fullest ? fromKey(`${fullest}-01`) : null,
    usualHour: most(perHour),
    words,
  };
}
