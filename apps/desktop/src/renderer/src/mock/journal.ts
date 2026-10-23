import type { DayKey } from "../lib/month";
import { type SampleDay, sampleDays } from "./sample-days";

/** A sample day as the screens show it, with its cover ready to load. */
export type MockDay = Omit<SampleDay, "coverId"> & { cover: string };

const COVERS = import.meta.glob<string>("./covers/*.webp", {
  eager: true,
  import: "default",
});

function withCover({ coverId, ...day }: SampleDay): MockDay {
  const cover = COVERS[`./covers/oct-${coverId}.webp`];
  if (!cover) {
    throw new Error(`Missing mock cover ${coverId}`);
  }
  return { ...day, cover };
}

/** Sample days standing in for the journal folder until the screens read it. */
export const MOCK_DAYS: ReadonlyMap<DayKey, MockDay> = new Map(
  [...sampleDays()].map(([key, day]) => [key, withCover(day)])
);
