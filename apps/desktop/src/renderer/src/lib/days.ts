import { useMemo } from "react";
import { MOCK_DAYS } from "../mock/journal";
import { mockPage } from "../mock/pages";
import { coverLabel, coverUrl } from "./covers";
import { dateFormat } from "./format";
import { type DayKey, fromKey } from "./month";
import { type TodayPage, useWrittenPages } from "./today-page";

/** A day before today: sealed with its page, or rested with nothing written. */
export type PastDay =
  | {
      kind: "written";
      /** Sample days stand for files in the journal; pages from this session live in memory. */
      source: "journal" | "memory";
      title: string;
      cover: { url: string; label: string } | null;
      markdown: string;
      words: number;
    }
  | { kind: "rested" };

function hasWords(page: TodayPage) {
  return page.words > 0 || page.title.trim() !== "";
}

/**
 * A past day from the sample journal, or from a page written while the app was
 * open and since sealed. The journal store replaces both later.
 */
export function usePastDay(key: DayKey): PastDay {
  const written = useWrittenPages().get(key);
  return useMemo(() => {
    if (written && hasWords(written)) {
      return {
        cover: written.cover
          ? { label: coverLabel(written.cover), url: coverUrl(written.cover) }
          : null,
        kind: "written",
        markdown: written.markdown,
        source: "memory",
        title: written.title,
        words: written.words,
      };
    }
    const day = MOCK_DAYS.get(key);
    if (!day) {
      return { kind: "rested" };
    }
    return {
      cover: { label: day.title, url: day.cover },
      kind: "written",
      markdown: mockPage(key, day),
      source: "journal",
      title: day.title,
      words: day.words,
    };
  }, [key, written]);
}

/**
 * The written days just before and after one, for the sealed day's arrows. After
 * the last sealed day comes today's page.
 */
export function useNeighbours(key: DayKey, today: DayKey) {
  const pages = useWrittenPages();
  return useMemo(() => {
    const keys = new Set(MOCK_DAYS.keys());
    for (const [day, page] of pages) {
      if (hasWords(page)) {
        keys.add(day);
      }
    }
    const sealed = [...keys].filter((day) => day < today).sort();
    const previous = sealed.findLast((day) => day < key);
    const next = sealed.find((day) => day > key) ?? "today";
    return { next, previous };
  }, [key, pages, today]);
}

/** Where a day's file lives, as §3.2 lays the journal out. */
export function journalPath(day: DayKey) {
  const [year, month, date] = day.split("-");
  return `~/Journal/${year}/${month}/${date}/${day}.md`;
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
