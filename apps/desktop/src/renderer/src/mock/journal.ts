import type { DayKey } from "../lib/month";

/**
 * Sample days from Paper's "05 Calendar", standing in for the journal folder until
 * the storage layer exists. Covers are the design's, cropped to the tile.
 */
export interface MockDay {
  cover: string;
  title: string;
  words: number;
}

const COVERS = import.meta.glob<string>("./covers/*.webp", {
  eager: true,
  import: "default",
});

function day(key: DayKey, title: string, words: number): [DayKey, MockDay] {
  const cover = COVERS[`./covers/oct-${key.slice(-2)}.webp`];
  if (!cover) {
    throw new Error(`Missing mock cover for ${key}`);
  }
  return [key, { cover, title, words }];
}

export const MOCK_DAYS: ReadonlyMap<DayKey, MockDay> = new Map([
  day("2026-10-01", "A new notebook", 412),
  day("2026-10-02", "Market morning", 388),
  day("2026-10-04", "Sunday pancakes", 521),
  day("2026-10-05", "On the train", 297),
  day("2026-10-07", "Mara’s birthday", 640),
  day("2026-10-08", "A slow morning", 455),
  day("2026-10-09", "Fresh air", 302),
  day("2026-10-10", "By the river", 389),
  day("2026-10-11", "Slow Sunday", 476),
  day("2026-10-12", "Rain and soup", 518),
  day("2026-10-13", "Home again", 350),
  day("2026-10-15", "First light", 433),
  day("2026-10-16", "Fresh flowers", 401),
  day("2026-10-18", "Evening walk", 366),
  day("2026-10-19", "On my way", 512),
  day("2026-10-20", "The long way home", 352),
]);
