import { describe, expect, it } from "vitest";
import { type GardenEntry, gardenGrid } from "./garden";

const WRITTEN: GardenEntry = {
  color: "daylily",
  hour: 21,
  state: "sealed",
  words: 300,
};

/** The cells of one week, Monday 2026-10-19 to Sunday 2026-10-25, with today on Saturday. */
function week(begins?: string) {
  const entries = new Map([["2026-10-22", WRITTEN]]);
  return gardenGrid(
    new Date(2026, 9, 19),
    new Date(2026, 9, 25),
    "2026-10-24",
    entries,
    begins
  ).cells;
}

describe("gardenGrid", () => {
  it("shows bare soil for unwritten days up to today, and faint days after", () => {
    const cells = week();
    expect(cells.slice(0, 3)).toEqual([null, null, null]);
    expect(cells[3]).toMatchObject({ color: "daylily", words: 300 });
    expect(cells.slice(4, 6)).toEqual([null, null]);
    expect(cells[6]).toBe("upcoming");
  });

  it("keeps days before the journal began faint, never bare soil", () => {
    const cells = week("2026-10-22");
    expect(cells.slice(0, 3)).toEqual(["upcoming", "upcoming", "upcoming"]);
    expect(cells[3]).toMatchObject({ color: "daylily" });
    expect(cells[4]).toBeNull();
  });
});
