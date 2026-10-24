import type { Clock } from "@daylily/core/clock";
import type { DayKey } from "@daylily/core/day";
import { hasEnded } from "@daylily/core/seal";
import type { ListedDay, UnreadableDay } from "../../shared/journal";
import type { Journal, SealCover } from "./store";

/**
 * Seals every day that has ended but isn't sealed yet, such as yesterday at 4am
 * or days left open while the app was closed. The page saves what it still holds
 * first, so a seal always has the last words. Returns the days it sealed.
 */
export async function sealEndedDays({
  journal,
  clock,
  flush,
  galleryCover,
}: {
  journal: Journal;
  clock: Clock;
  /** Saves whatever the page hasn't written yet. */
  flush: () => Promise<void>;
  /** A gallery picture for a day without a cover, or null when none is given. */
  galleryCover: () => Promise<SealCover | null>;
}): Promise<DayKey[]> {
  const endedDays = async () =>
    (await journal.listDays()).filter(
      (day): day is Exclude<ListedDay, UnreadableDay> =>
        day.state === "open" && hasEnded(day.day, clock.now(), clock.timeZone())
    );
  if ((await endedDays()).length === 0) {
    return [];
  }
  await flush();
  // Listed again, now that the page's last saves are on disk
  const ended = await endedDays();
  // Each day on its own: one that fails leaves the rest to seal
  const results = await Promise.all(
    ended.map(async (day) => {
      try {
        const cover = day.cover === null ? await galleryCover() : null;
        const result = await journal.sealDay(day.day, cover);
        if (!result.ok) {
          console.error(`Could not seal ${day.day}`, result.error);
        }
        return result.ok && result.value === "sealed" ? day.day : null;
      } catch (error) {
        console.error(`Could not seal ${day.day}`, error);
        return null;
      }
    })
  );
  return results.filter((day) => day !== null);
}
