import { describe, expect, it } from "vitest";
import { instantAt, isoWithOffset, isTimeZone, offsetMinutes } from "./zone";

const at = (iso: string) => new Date(iso);

describe("isoWithOffset", () => {
  it("writes the wall time with the zone's offset", () => {
    expect(isoWithOffset(at("2026-10-21T18:02:11Z"), "Africa/Tunis")).toBe(
      "2026-10-21T19:02:11+01:00"
    );
  });

  it("follows summer time", () => {
    const zone = "America/New_York";
    expect(isoWithOffset(at("2026-07-01T16:00:00Z"), zone)).toBe(
      "2026-07-01T12:00:00-04:00"
    );
    expect(isoWithOffset(at("2026-12-01T17:00:00Z"), zone)).toBe(
      "2026-12-01T12:00:00-05:00"
    );
  });

  it("keeps offsets that aren't whole hours", () => {
    const instant = at("2026-10-21T12:00:00Z");
    expect(isoWithOffset(instant, "Asia/Kolkata")).toBe(
      "2026-10-21T17:30:00+05:30"
    );
    expect(isoWithOffset(instant, "Asia/Kathmandu")).toBe(
      "2026-10-21T17:45:00+05:45"
    );
    expect(isoWithOffset(instant, "America/St_Johns")).toBe(
      "2026-10-21T09:30:00-02:30"
    );
  });

  it("writes UTC as +00:00", () => {
    expect(isoWithOffset(at("2026-10-21T12:00:00Z"), "UTC")).toBe(
      "2026-10-21T12:00:00+00:00"
    );
  });

  it("reads back to the same instant", () => {
    const instant = at("2026-03-29T01:30:00Z");
    const iso = isoWithOffset(instant, "Europe/Paris");
    expect(new Date(iso).getTime()).toBe(instant.getTime());
  });
});

describe("offsetMinutes", () => {
  it("measures the zone against UTC", () => {
    expect(offsetMinutes(at("2026-10-21T12:00:00Z"), "Asia/Kathmandu")).toBe(
      345
    );
    expect(offsetMinutes(at("2026-10-21T12:00:00Z"), "America/Denver")).toBe(
      -360
    );
  });
});

describe("instantAt", () => {
  const wall = (day: number, month: number, hour: number, minute = 0) => ({
    day,
    hour,
    minute,
    month,
    second: 0,
    year: 2026,
  });

  it("finds an ordinary wall time", () => {
    expect(instantAt(wall(21, 10, 4), "Africa/Tunis")).toEqual(
      at("2026-10-21T03:00:00Z")
    );
  });

  it("takes the earlier of a time that happens twice as clocks fall back", () => {
    // Paris goes from 03:00 summer time back to 02:00 on 25 October
    expect(instantAt(wall(25, 10, 2, 30), "Europe/Paris")).toEqual(
      at("2026-10-25T00:30:00Z")
    );
  });

  it("moves a time that clocks spring over past the jump", () => {
    // Paris goes from 02:00 straight to 03:00 on 29 March
    expect(instantAt(wall(29, 3, 2, 30), "Europe/Paris")).toEqual(
      at("2026-03-29T01:30:00Z")
    );
  });
});

describe("isTimeZone", () => {
  it("knows IANA zones and nothing else", () => {
    expect(isTimeZone("Africa/Tunis")).toBe(true);
    expect(isTimeZone("UTC")).toBe(true);
    expect(isTimeZone("Mars/Olympus_Mons")).toBe(false);
    expect(isTimeZone("")).toBe(false);
  });
});
