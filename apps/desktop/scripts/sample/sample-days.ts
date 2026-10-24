import type { FlowerColor } from "@daylily/core/flower";
import { type DayKey, dayKey, fromKey, todayKey } from "../lib/month";

/**
 * Sample days: what the screens show until they read the journal, and what the
 * seed script writes into one. October 2026 is Paper's "05 Calendar" exactly;
 * the months before it are grown from a seed so the garden has something to show.
 */
export interface SampleDay {
  /** The flower's colour, which the real app samples from the cover. */
  color: FlowerColor;
  /** Which of `mock/covers/oct-<id>.webp` is its cover. */
  coverId: string;
  /** A first line, for the days the design quotes. */
  excerpt?: string;
  /** The hour writing began, 0 to 23. */
  hour: number;
  title: string;
  words: number;
}

/** Each cover's dominant colour, as a flower. */
const COVER_COLORS: Record<string, FlowerColor> = {
  "01": "saffron",
  "02": "daylily",
  "04": "saffron",
  "05": "daylily",
  "07": "petal",
  "08": "petal",
  "09": "petal",
  "10": "cornflower",
  "11": "daylily",
  "12": "cornflower",
  "13": "cornflower",
  "15": "saffron",
  "16": "daylily",
  "18": "petal",
  "19": "saffron",
  "20": "daylily",
};
const COVER_IDS = Object.keys(COVER_COLORS);

function cover(id: string) {
  return { color: COVER_COLORS[id] ?? "daylily", coverId: id };
}

const OCTOBER: [day: string, title: string, words: number][] = [
  ["01", "A new notebook", 412],
  ["02", "Market morning", 388],
  ["04", "Sunday pancakes", 521],
  ["05", "On the train", 297],
  ["07", "Mara’s birthday", 640],
  ["08", "A slow morning", 455],
  ["09", "Fresh air", 302],
  ["10", "By the river", 389],
  ["11", "Slow Sunday", 476],
  ["12", "Rain and soup", 518],
  ["13", "Home again", 350],
  ["15", "First light", 433],
  ["16", "Fresh flowers", 401],
  ["18", "Evening walk", 54],
  ["19", "On my way", 512],
  ["20", "The long way home", 71],
];

const TITLES = [
  "A quiet Tuesday",
  "Coffee with Sam",
  "Long walk home",
  "Rain all day",
  "Small wins",
  "Back to it",
  "Late light",
  "A good tired",
  "Sunday reset",
  "Letters",
  "The bus ride",
  "Garden chores",
  "New shoes",
  "Out with friends",
  "Thinking about home",
  "Market day",
];

const FIRST_DAY = new Date(2025, 3, 14);
const OCTOBER_2026 = "2026-10";
const WRITE_CHANCE = 0.8;

/** Park–Miller PRNG, seeded so the sample garden is the same on every launch. */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16_807) % 2_147_483_647;
    return (state - 1) / 2_147_483_646;
  };
}

function grow(): Map<DayKey, SampleDay> {
  const days = new Map<DayKey, SampleDay>();
  const random = seededRandom(1015);
  const today = todayKey(new Date());

  for (
    const date = new Date(FIRST_DAY);
    dayKey(date) < today;
    date.setDate(date.getDate() + 1)
  ) {
    const key = dayKey(date);
    const roll = random();
    const pick = random();
    const length = random();
    const late = random();
    if (key.startsWith(OCTOBER_2026) || roll > WRITE_CHANCE) {
      continue;
    }
    const id = COVER_IDS[Math.floor(pick * COVER_IDS.length)] ?? "01";
    days.set(key, {
      ...cover(id),
      // Most evenings land between nine and ten, as in Paper's garden stats
      hour: late < 0.7 ? 21 : 18 + Math.floor(late * 5),
      title: TITLES[Math.floor(length * TITLES.length)] ?? "A day",
      words: Math.round(80 + length ** 1.5 * 820),
    });
  }

  for (const [day, title, words] of OCTOBER) {
    days.set(`${OCTOBER_2026}-${day}`, {
      ...cover(day),
      hour: 21,
      title,
      words,
    });
  }

  // Home's "one year ago today" card, wherever today falls
  const yearAgo = fromKey(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  days.set(dayKey(yearAgo), {
    ...cover("10"),
    excerpt:
      "He skipped a stone eleven times and pretended it was nothing. I’m still smiling about it.",
    hour: 20,
    title: "By the river with Dad",
    words: 468,
  });

  return days;
}

/** The sample journal, grown up to today. */
export function sampleDays(): ReadonlyMap<DayKey, SampleDay> {
  return grow();
}
