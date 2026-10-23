import { describe, expect, it } from "vitest";
import type { Clock } from "./clock";
import {
  addDays,
  type DayKey,
  dayEnd,
  dayOf,
  dayPath,
  parseDayKey,
  today,
} from "./day";

const at = (iso: string) => new Date(iso);
const key = (text: string) => {
  const day = parseDayKey(text);
  if (!day) {
    throw new Error(`Not a day: ${text}`);
  }
  return day;
};

describe("dayOf", () => {
  const tunis = "Africa/Tunis";

  it("keeps the small hours with the day being lived", () => {
    expect(dayOf(at("2026-10-22T02:59:59+01:00"), tunis)).toBe("2026-10-21");
    expect(dayOf(at("2026-10-22T01:00:00+01:00"), tunis)).toBe("2026-10-21");
  });

  it("turns at 4am", () => {
    expect(dayOf(at("2026-10-22T03:59:59+01:00"), tunis)).toBe("2026-10-21");
    expect(dayOf(at("2026-10-22T04:00:00+01:00"), tunis)).toBe("2026-10-22");
  });

  it("belongs to the same day until midnight", () => {
    expect(dayOf(at("2026-10-21T23:59:59+01:00"), tunis)).toBe("2026-10-21");
  });

  it("carries the small hours back across months, years and leap days", () => {
    expect(dayOf(at("2027-01-01T02:00:00+01:00"), tunis)).toBe("2026-12-31");
    expect(dayOf(at("2028-03-01T03:00:00+01:00"), tunis)).toBe("2028-02-29");
  });

  it("turns at 4am on the wall clock the night clocks spring forward", () => {
    // Paris skips 02:00 to 03:00 on 29 March; four hours earlier than 04:30 is still the 28th
    const paris = "Europe/Paris";
    expect(dayOf(at("2026-03-29T03:59:00+02:00"), paris)).toBe("2026-03-28");
    expect(dayOf(at("2026-03-29T04:00:00+02:00"), paris)).toBe("2026-03-29");
    expect(dayOf(at("2026-03-29T04:30:00+02:00"), paris)).toBe("2026-03-29");
  });

  it("turns at 4am on the wall clock the night clocks fall back", () => {
    // Paris lives 02:00 to 03:00 twice on 25 October
    const paris = "Europe/Paris";
    expect(dayOf(at("2026-10-25T02:30:00+02:00"), paris)).toBe("2026-10-24");
    expect(dayOf(at("2026-10-25T02:30:00+01:00"), paris)).toBe("2026-10-24");
    expect(dayOf(at("2026-10-25T03:59:00+01:00"), paris)).toBe("2026-10-24");
    expect(dayOf(at("2026-10-25T04:00:00+01:00"), paris)).toBe("2026-10-25");
  });

  it("follows the zone the device is in", () => {
    // 05:00 in Tunis is 23:00 the night before in New York
    const instant = at("2026-10-22T04:00:00Z");
    expect(dayOf(instant, tunis)).toBe("2026-10-22");
    expect(dayOf(instant, "America/New_York")).toBe("2026-10-21");
    expect(dayOf(instant, "Pacific/Kiritimati")).toBe("2026-10-22");
  });

  it("turns at 4am in zones with half-hour offsets", () => {
    const kolkata = "Asia/Kolkata";
    expect(dayOf(at("2026-10-22T03:59:00+05:30"), kolkata)).toBe("2026-10-21");
    expect(dayOf(at("2026-10-22T04:00:00+05:30"), kolkata)).toBe("2026-10-22");
  });
});

describe("today", () => {
  it("reads the injected clock in its zone", () => {
    const clock: Clock = {
      now: () => at("2026-10-22T02:00:00Z"),
      timeZone: () => "Asia/Tokyo",
    };
    expect(today(clock)).toBe("2026-10-22");
    expect(today({ ...clock, timeZone: () => "Europe/London" })).toBe(
      "2026-10-21"
    );
  });
});

describe("dayEnd", () => {
  it("is 4am on the next date", () => {
    expect(dayEnd(key("2026-10-21"), "Africa/Tunis")).toEqual(
      at("2026-10-22T04:00:00+01:00")
    );
  });

  it("crosses months and years", () => {
    expect(dayEnd(key("2026-12-31"), "UTC")).toEqual(
      at("2027-01-01T04:00:00Z")
    );
    expect(dayEnd(key("2028-02-28"), "UTC")).toEqual(
      at("2028-02-29T04:00:00Z")
    );
  });

  it("gives a 23 hour day when clocks spring forward", () => {
    const paris = "Europe/Paris";
    const start = dayEnd(key("2026-03-27"), paris);
    const end = dayEnd(key("2026-03-28"), paris);
    expect(end).toEqual(at("2026-03-29T04:00:00+02:00"));
    expect(end.getTime() - start.getTime()).toBe(23 * 3_600_000);
  });

  it("gives a 25 hour day when clocks fall back", () => {
    const paris = "Europe/Paris";
    const start = dayEnd(key("2026-10-23"), paris);
    const end = dayEnd(key("2026-10-24"), paris);
    expect(end).toEqual(at("2026-10-25T04:00:00+01:00"));
    expect(end.getTime() - start.getTime()).toBe(25 * 3_600_000);
  });

  it("is the first moment of the next day", () => {
    const zone = "America/New_York";
    const end = dayEnd(key("2026-11-01"), zone);
    expect(dayOf(new Date(end.getTime() - 1), zone)).toBe("2026-11-01");
    expect(dayOf(end, zone)).toBe("2026-11-02");
  });
});

describe("parseDayKey", () => {
  it("accepts real dates", () => {
    expect(parseDayKey("2026-10-21")).toBe("2026-10-21");
    expect(parseDayKey("2028-02-29")).toBe("2028-02-29");
  });

  it("refuses dates that don't exist", () => {
    expect(parseDayKey("2026-02-29")).toBeNull();
    expect(parseDayKey("2026-13-01")).toBeNull();
    expect(parseDayKey("2026-04-31")).toBeNull();
    expect(parseDayKey("2026-00-10")).toBeNull();
  });

  it("refuses anything but YYYY-MM-DD", () => {
    expect(parseDayKey("2026-1-01")).toBeNull();
    expect(parseDayKey("2026-10-21.md")).toBeNull();
    expect(parseDayKey("../2026-10-21")).toBeNull();
    expect(parseDayKey("")).toBeNull();
  });
});

describe("addDays", () => {
  it("counts across months, years and leap days", () => {
    const day = key("2028-02-28");
    expect(addDays(day, 1)).toBe("2028-02-29");
    expect(addDays(day, 2)).toBe("2028-03-01");
    expect(addDays(key("2026-12-31"), 1)).toBe("2027-01-01");
    expect(addDays(key("2026-01-01"), -1)).toBe("2025-12-31");
  });

  it("compares as text in date order", () => {
    const days: DayKey[] = [key("2026-10-21"), key("2025-12-31")];
    expect(days.sort()).toEqual(["2025-12-31", "2026-10-21"]);
  });
});

describe("dayPath", () => {
  it("files a day under its year, month and date", () => {
    expect(dayPath(key("2026-10-21"))).toEqual([
      "2026",
      "10",
      "21",
      "2026-10-21.md",
    ]);
  });
});
