import type { DayKey } from "@daylily/core/day";
import { pageText } from "@daylily/core/excerpt";
import { queryWords, searchSnippet } from "@daylily/core/search-text";
import { create, insert, remove, search } from "@orama/orama";
import type { SearchHit } from "../../shared/journal";
import type { Journal } from "./store";

/** Enough for anyone to find a day; more is a list nobody reads. */
const MAX_HITS = 40;
/** A typo is forgiven only in longer words, so "sea" never finds "tea". */
const TYPO_FROM_LENGTH = 5;

type Entry = Omit<SearchHit, "snippet"> & { text: string };

const newIndex = () =>
  create({ schema: { text: "string", title: "string" } as const });

/**
 * Full-text search over the journal, kept in memory: built from the files the
 * first time it's needed, then kept current as days change on disk. Nothing
 * leaves the computer, and nothing is written to the journal.
 */
export function journalSearch(journal: Pick<Journal, "listDays" | "readDay">) {
  let index = newIndex();
  const entries = new Map<DayKey, Entry>();
  let building: Promise<void> | null = null;
  // Changes are indexed one batch at a time, so a day is never put twice at once
  let refreshing = Promise.resolve();

  /** Reads a day again and indexes it as it now is; a day that's gone or unreadable leaves. */
  async function put(day: DayKey) {
    if (entries.delete(day)) {
      await remove(index, day);
    }
    const read = await journal.readDay(day);
    if (!(read.ok && read.value)) {
      return;
    }
    const { color, cover, state, title } = read.value;
    const text = pageText(read.value.body);
    entries.set(day, { color, cover, day, state, text, title });
    await insert(index, { id: day, text, title });
  }

  async function build() {
    index = newIndex();
    entries.clear();
    const days = await journal.listDays();
    await Promise.all(
      days.flatMap((listed) =>
        listed.state === "unreadable" ? [] : [put(listed.day)]
      )
    );
  }

  /** The index, built once; a failed build is tried again next time. */
  function ready() {
    building ??= build().catch((error: unknown) => {
      building = null;
      throw error;
    });
    return building;
  }

  return {
    /** Days whose title or page holds every word of `query`, best first. */
    async find(query: string): Promise<SearchHit[]> {
      const words = queryWords(query);
      if (words.length === 0) {
        return [];
      }
      await ready();
      // Orama answers at once from memory; it only returns a promise with async plugins
      const result = await search(index, {
        boost: { title: 2 },
        limit: MAX_HITS,
        properties: ["title", "text"],
        term: words.join(" "),
        // Every word must be there, not any of them
        threshold: 0,
        tolerance: words.every((word) => word.length >= TYPO_FROM_LENGTH)
          ? 1
          : 0,
      });
      return result.hits.flatMap(({ id }) => {
        const entry = entries.get(id as DayKey);
        if (!entry) {
          return [];
        }
        const { text, ...hit } = entry;
        return [{ ...hit, snippet: searchSnippet(text, query) }];
      });
    },

    /** Indexes the days that changed on disk, once the index exists. */
    refresh(days: readonly DayKey[]) {
      const built = building;
      if (!built) {
        return Promise.resolve();
      }
      refreshing = refreshing.then(async () => {
        await built;
        // The watcher reports each day once per batch, so these never collide
        await Promise.all(days.map(put));
      });
      // A failed batch is logged by the caller and doesn't stop the next one
      const batch = refreshing;
      refreshing = batch.catch(() => undefined);
      return batch;
    },

    /** Builds the index ahead of the first search, so it answers at once. */
    warm: () => ready().then(() => undefined),
  };
}

export type JournalSearch = ReturnType<typeof journalSearch>;
