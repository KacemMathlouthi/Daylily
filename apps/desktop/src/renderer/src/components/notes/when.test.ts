import { describe, expect, it } from "vitest";
import { changedLong, changedOn, changedShort } from "./when";

// Local times, as the computer reads them
const NOW = new Date(2026, 9, 26, 21, 30);
const at = (month: number, date: number, hour = 14, minute = 10, year = 2026) =>
  new Date(year, month - 1, date, hour, minute).toISOString();

describe("when a note changed", () => {
  it("says the time today, and the day otherwise", () => {
    expect(changedShort(at(10, 26), NOW)).toBe("14:10");
    expect(changedShort(at(10, 25), NOW)).toBe("Yesterday");
    expect(changedShort(at(10, 21), NOW)).toBe("Oct 21");
    expect(changedShort(at(10, 21, 9, 0, 2025), NOW)).toBe("Oct 21, 2025");
  });

  it("says it in a sentence over the note", () => {
    expect(changedLong(at(10, 26, 9, 5), NOW)).toBe("Changed today at 09:05");
    expect(changedLong(at(10, 25), NOW)).toBe("Changed yesterday at 14:10");
    expect(changedLong(at(10, 12), NOW)).toBe("Changed Oct 12");
  });

  it("goes by the calendar, not the journal's 4am day", () => {
    expect(changedOn(at(10, 26, 1, 0), NOW)).toBe("today");
  });
});
