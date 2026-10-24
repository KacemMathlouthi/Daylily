import { journalAssetUrl } from "../../../shared/journal";
import { markSaved, scheduleSave } from "./autosave";
import type { GalleryId } from "./covers";
import type { DayKey } from "./month";
import { createStore } from "./store";

/** A cover copied into the day's folder. */
export interface PageCover {
  /** The gallery picture it came from, so the picker shows it chosen. */
  galleryId?: GalleryId;
  /** Its file in the day's folder, like `cover.jpg`. */
  name: string;
  /** Changes when the file is replaced, so the picture on screen reloads. */
  version: number;
}

export interface TodayPage {
  cover: PageCover | null;
  day: DayKey;
  /** The page's words as markdown, the way they're written to the day's file. */
  markdown: string;
  title: string;
  words: number;
}

/**
 * Reading today's file: until it's read the page can't be shown, and a file that
 * can't be read, or is already sealed, is shown but never written over.
 */
export type PageLoad =
  | { state: "loading" }
  | { state: "ready" }
  | { state: "locked"; reason: "sealed" | "unreadable" };

function blankPage(day: DayKey): TodayPage {
  return { cover: null, day, markdown: "", title: "", words: 0 };
}

/**
 * Pages by day, held here while they're written and saved to the journal as they
 * change. The day before stays while it seals in place at 4am.
 */
const store = createStore<ReadonlyMap<DayKey, TodayPage>>(new Map());
const loads = createStore<ReadonlyMap<DayKey, PageLoad>>(new Map());

function setLoad(day: DayKey, load: PageLoad) {
  loads.set((current) => new Map(current).set(day, load));
}

function setPage(day: DayKey, page: TodayPage) {
  store.set((pages) => new Map(pages).set(day, page));
}

/** Reads a day's file into the page, once. */
export async function loadPage(day: DayKey) {
  if (loads.get().has(day)) {
    return;
  }
  setLoad(day, { state: "loading" });
  let read: Awaited<ReturnType<typeof window.daylily.journal.read>>;
  try {
    read = await window.daylily.journal.read(day);
  } catch (error) {
    console.error("Could not read the page", error);
    setLoad(day, { reason: "unreadable", state: "locked" });
    return;
  }
  if (!read.ok) {
    setLoad(day, { reason: "unreadable", state: "locked" });
    return;
  }
  const file = read.value;
  if (file) {
    setPage(day, {
      cover: file.cover ? { name: file.cover, version: Date.now() } : null,
      day,
      markdown: file.body,
      title: file.title,
      words: file.words,
    });
    markSaved(day);
  }
  setLoad(
    day,
    file && file.state !== "open"
      ? { reason: "sealed", state: "locked" }
      : { state: "ready" }
  );
}

export function usePageLoad(day: DayKey): PageLoad {
  return loads.use().get(day) ?? { state: "loading" };
}

/** Today's page; a day with nothing written opens on a blank one. */
export function useTodayPage(today: DayKey): TodayPage {
  return store.use().get(today) ?? blankPage(today);
}

/** Where the page's cover shows from, in the day's folder. */
export function pageCoverUrl(page: TodayPage) {
  return page.cover
    ? `${journalAssetUrl(page.day, page.cover.name)}?v=${page.cover.version}`
    : null;
}

/** Changes a day's page and saves it to the journal shortly after. */
export function updateTodayPage(
  day: DayKey,
  change: Partial<Omit<TodayPage, "day">>
) {
  setPage(day, { ...(store.get().get(day) ?? blankPage(day)), ...change });
  scheduleSave(day, () => {
    const page = store.get().get(day);
    return page
      ? {
          body: page.markdown,
          cover: page.cover?.name ?? null,
          title: page.title,
        }
      : null;
  });
}
