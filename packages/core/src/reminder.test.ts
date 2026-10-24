import { describe, expect, it } from "vitest";
import { type DayKey, parseDayKey } from "./day";
import { nextReminder, reminderAt } from "./reminder";

const key = (text: string): DayKey => {
  const day = parseDayKey(text);
  if (!day) {
    throw new Error(`Not a day: ${text}`);
  }
  return day;
};

const TUNIS = "Africa/Tunis";

describe("reminderAt", () => {
  it("falls at the chosen time on the day's own date", () => {
    expect(reminderAt(key("2026-10-21"), "21:00", TUNIS)).toEqual(
      new Date("2026-10-21T21:00:00+01:00")
    );
  });

  it("puts a time after midnight on the next date, still the same day", () => {
    expect(reminderAt(key("2026-10-21"), "01:30", TUNIS)).toEqual(
      new Date("2026-10-22T01:30:00+01:00")
    );
  });

  it("follows the zone's offset across summer time", () => {
    const zone = "America/New_York";
    expect(reminderAt(key("2026-03-07"), "21:00", zone)).toEqual(
      new Date("2026-03-07T21:00:00-05:00")
    );
    expect(reminderAt(key("2026-03-08"), "21:00", zone)).toEqual(
      new Date("2026-03-08T21:00:00-04:00")
    );
  });

  it("moves a time the clocks skip to just past the jump", () => {
    // Paris springs from 02:00 to 03:00 on 29 March 2026
    expect(reminderAt(key("2026-03-28"), "02:30", "Europe/Paris")).toEqual(
      new Date("2026-03-29T03:30:00+02:00")
    );
  });
});

describe("nextReminder", () => {
  const time = "21:00";

  it("waits for this evening's reminder", () => {
    expect(
      nextReminder({
        now: new Date("2026-10-21T18:00:00+01:00"),
        remindedOn: null,
        time,
        zone: TUNIS,
      })
    ).toEqual({ at: new Date("2026-10-21T21:00:00+01:00"), day: "2026-10-21" });
  });

  it("still gives a reminder missed while asleep, if only a little late", () => {
    expect(
      nextReminder({
        now: new Date("2026-10-21T22:30:00+01:00"),
        remindedOn: null,
        time,
        zone: TUNIS,
      })
    ).toEqual({ at: new Date("2026-10-21T21:00:00+01:00"), day: "2026-10-21" });
  });

  it("lets a reminder missed by hours go, and waits for tomorrow's", () => {
    expect(
      nextReminder({
        now: new Date("2026-10-22T00:30:00+01:00"),
        remindedOn: null,
        time,
        zone: TUNIS,
      })
    ).toEqual({ at: new Date("2026-10-22T21:00:00+01:00"), day: "2026-10-22" });
  });

  it("gives each day one reminder at most", () => {
    expect(
      nextReminder({
        now: new Date("2026-10-21T21:00:30+01:00"),
        remindedOn: key("2026-10-21"),
        time,
        zone: TUNIS,
      })
    ).toEqual({ at: new Date("2026-10-22T21:00:00+01:00"), day: "2026-10-22" });
  });

  it("counts the small hours as the day being lived", () => {
    expect(
      nextReminder({
        now: new Date("2026-10-22T01:00:00+01:00"),
        remindedOn: null,
        time: "01:30",
        zone: TUNIS,
      })
    ).toEqual({ at: new Date("2026-10-22T01:30:00+01:00"), day: "2026-10-21" });
  });
});
