import type { Cover } from "./covers";
import type { DayKey } from "./month";
import { createStore } from "./store";

export interface TodayPage {
  cover: Cover | null;
  day: DayKey;
  /** The page's words as markdown, the way they'll be written to the day's file. */
  markdown: string;
  title: string;
  words: number;
}

function blankPage(day: DayKey): TodayPage {
  return { cover: null, day, markdown: "", title: "", words: 0 };
}

/**
 * Pages by day, kept in memory so they survive a visit to another screen and the
 * 4am turn of the day. They are lost when the app closes, until the journal
 * folder and autosave exist.
 */
const store = createStore<ReadonlyMap<DayKey, TodayPage>>(new Map());

/** Today's page; a new day opens on a blank one. */
export function useTodayPage(today: DayKey): TodayPage {
  return store.use().get(today) ?? blankPage(today);
}

/** Changes today's page, leaving earlier days as they were. */
export function updateTodayPage(
  today: DayKey,
  change: Partial<Omit<TodayPage, "day">>
) {
  store.set((pages) => {
    const next = new Map(pages);
    next.set(today, { ...(pages.get(today) ?? blankPage(today)), ...change });
    return next;
  });
}
