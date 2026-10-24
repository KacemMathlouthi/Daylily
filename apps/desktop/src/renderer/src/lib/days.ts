import { useMemo } from "react";
import { journalAssetUrl } from "../../../shared/journal";
import { dateFormat } from "./format";
import { useJournalListing, useStoredDay } from "./journal";
import { type DayKey, fromKey } from "./month";

/**
 * A day before today: sealed with its page, rested with nothing written, a file
 * that can't be read, or still being read.
 */
export type PastDay =
  | { kind: "loading" }
  | {
      kind: "written";
      title: string;
      cover: { url: string; label: string } | null;
      /** Changed in another app after it sealed: its seal no longer matches. */
      edited: boolean;
      markdown: string;
      words: number;
    }
  | { kind: "rested" }
  | { kind: "unreadable" };

/** A past day from its file in the journal. */
export function usePastDay(key: DayKey): PastDay {
  const stored = useStoredDay(key);
  return useMemo((): PastDay => {
    if (stored === undefined) {
      return { kind: "loading" };
    }
    if (stored === null) {
      return { kind: "rested" };
    }
    if (stored === "unreadable") {
      return { kind: "unreadable" };
    }
    return {
      cover: stored.cover
        ? {
            label: stored.title || "The day’s cover",
            url: `${journalAssetUrl(key, stored.cover)}?v=${stored.coverStamp ?? ""}`,
          }
        : null,
      edited: stored.state === "edited",
      kind: "written",
      markdown: stored.body,
      title: stored.title,
      words: stored.words,
    };
  }, [key, stored]);
}

/**
 * The written days just before and after one, for the sealed day's arrows. After
 * the last sealed day comes today's page.
 */
export function useNeighbours(key: DayKey, today: DayKey) {
  const { days, ready } = useJournalListing();
  return useMemo(() => {
    if (!ready) {
      return { next: undefined, previous: undefined };
    }
    const sealed = [...days.keys()].filter((day) => day < today).sort();
    const previous = sealed.findLast((day) => day < key);
    const next = sealed.find((day) => day > key) ?? "today";
    return { next, previous };
  }, [days, key, ready, today]);
}

const WEEKDAY = dateFormat({ weekday: "long" });
const MONTH_DAY = dateFormat({
  day: "numeric",
  month: "long",
});
const FULL_DATE = dateFormat({
  day: "numeric",
  month: "long",
  year: "numeric",
});
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** "Sealed Monday at 4am" within the week, a date further back, with the year once it differs. */
export function sealedLabel(day: DayKey, today: DayKey) {
  const sealedOn = fromKey(day);
  sealedOn.setDate(sealedOn.getDate() + 1);
  const now = fromKey(today);
  let when = MONTH_DAY.format(sealedOn);
  if (now.getTime() - sealedOn.getTime() < WEEK_MS) {
    when = WEEKDAY.format(sealedOn);
  } else if (sealedOn.getFullYear() !== now.getFullYear()) {
    when = FULL_DATE.format(sealedOn);
  }
  return `Sealed ${when} at 4am`;
}
