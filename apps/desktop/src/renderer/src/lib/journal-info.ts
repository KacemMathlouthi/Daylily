import { useQuery } from "@tanstack/react-query";
import type { DayKey } from "./month";

export const JOURNAL_INFO_KEY = ["journal", "info"] as const;

/** The journal's folder and preferences, read once; they change only through Settings. */
export function useJournalInfo() {
  return useQuery({
    queryFn: () => window.daylily.journal.info(),
    queryKey: JOURNAL_INFO_KEY,
    staleTime: Number.POSITIVE_INFINITY,
  }).data;
}

/** Where a day's file is, as people read paths: `~/Daylily/2026/10/24/2026-10-24.md`. */
export function dayFileLabel(
  info: { displayRoot: string; separator: string },
  day: DayKey
) {
  const [year, month, date] = day.split("-");
  return [info.displayRoot, year, month, date, `${day}.md`].join(
    info.separator
  );
}
