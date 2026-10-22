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
 * Today's page, kept in memory so it survives a visit to another screen. It is
 * lost when the app closes, until the journal folder and autosave exist.
 */
const store = createStore<TodayPage>(blankPage(""));

/** Today's page; a new day opens on a blank one. */
export function useTodayPage(today: DayKey): TodayPage {
  const page = store.use();
  return page.day === today ? page : blankPage(today);
}

/** Changes today's page, starting a fresh one if the day has turned. */
export function updateTodayPage(
  today: DayKey,
  change: Partial<Omit<TodayPage, "day">>
) {
  store.set((page) => ({
    ...(page.day === today ? page : blankPage(today)),
    ...change,
  }));
}
