import type { Clock } from "@daylily/core/clock";
import type { DayKey } from "@daylily/core/day";
import { nextReminder } from "@daylily/core/reminder";
import { BrowserWindow, Notification, powerMonitor } from "electron";
import { flushAllPages } from "./flush";
import { readConfig } from "./journal/config";
import type { Journal } from "./journal/store";

/** Looked at again at least this often, in case the clock or the zone moved. */
const LONGEST_WAIT_MS = 60 * 60 * 1000;

/**
 * The evening reminder (spec §3.5): "How was your day?" at the journal's chosen
 * time, once a day. Skipped when today already has words, or when Daylily is in
 * front of the person anyway. Returns a way to look again, as after Settings change.
 */
export function remindInTheEvening({
  journal,
  clock,
  icon,
  onEnabledChange,
  openToday,
}: {
  /** Whichever journal is open now; its preferences hold the reminder. */
  journal: () => Journal;
  clock: Clock;
  icon: string;
  /** Told whether the reminder is on, so the app can stay in the tray for it. */
  onEnabledChange: (enabled: boolean) => void;
  /** Opens today's page, when the reminder is clicked. */
  openToday: () => void;
}) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let remindedOn: DayKey | null = null;
  let remindAt: string | null = null;
  // Opened after the reminder's time, Daylily came anyway; only waking from sleep catches up
  let opening = true;
  // Held while shown: a notification nothing refers to can be collected, and its click lost
  let shown: Notification | null = null;

  async function remind(day: DayKey) {
    if (remindedOn === day) {
      return;
    }
    remindedOn = day;
    if (BrowserWindow.getFocusedWindow()) {
      return;
    }
    await flushAllPages();
    const read = await journal().readDay(day);
    if (!read.ok || (read.value?.words ?? 0) > 0) {
      return;
    }
    shown = new Notification({
      body: "How was your day?",
      icon,
      title: "Daylily",
    });
    shown.on("click", openToday);
    shown.show();
  }

  // Each look supersedes the ones before it, so only the latest sets a timer
  let looks = 0;

  /** Gives the reminder if it's due now, then waits for the next one. */
  async function schedule() {
    looks += 1;
    const look = looks;
    clearTimeout(timer);
    const { reminder } = await readConfig(journal().root);
    if (look !== looks) {
      return;
    }
    onEnabledChange(reminder.enabled);
    // A new time is a new reminder, even on a day that had one
    if (reminder.time !== remindAt) {
      remindAt = reminder.time;
      remindedOn = null;
    }
    if (!(reminder.enabled && Notification.isSupported())) {
      return;
    }
    const now = clock.now();
    const next = nextReminder({
      now,
      remindedOn,
      time: reminder.time,
      zone: clock.timeZone(),
    });
    const due = next.at <= now;
    if (due && opening) {
      // Opened after the reminder's time: Daylily came anyway
      remindedOn = next.day;
    } else if (due) {
      await remind(next.day).catch((error) =>
        console.error("Could not give the reminder", error)
      );
    }
    opening = false;
    if (due) {
      check();
      return;
    }
    // Woken a little early or late, it looks again against the clock as it is then
    timer = setTimeout(
      check,
      Math.min(next.at.getTime() - now.getTime(), LONGEST_WAIT_MS)
    );
  }

  function check() {
    schedule().catch((error) =>
      console.error("Could not schedule the reminder", error)
    );
  }

  check();
  powerMonitor.on("resume", check);
  return check;
}
