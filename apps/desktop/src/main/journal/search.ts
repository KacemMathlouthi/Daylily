import type { DayKey } from "@daylily/core/day";
import { pageText } from "@daylily/core/excerpt";
import {
  matchRanges,
  queryWords,
  searchSnippet,
  TYPO_FROM_LENGTH,
} from "@daylily/core/search-text";
import { create, insert, remove, search } from "@orama/orama";
import { MAX_SEARCH_HITS, type SearchHit } from "../../shared/journal";
import type { Journal } from "./store";

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
    /** Days whose title or page holds every word of `query`, best first, up to one more than `MAX_SEARCH_HITS`. */
    async find(query: string): Promise<SearchHit[]> {
      const words = queryWords(query);
      if (words.length === 0) {
        return [];
      }
      await ready();
      // Orama answers at once from memory; it only returns a promise with async plugins
      const result = await search(index, {
        boost: { title: 2 },
        // Every candidate, ranked: the index can't be told the rules per word, so
        // it's asked broadly and its hits are held to them below
        limit: Math.max(1, entries.size),
        properties: ["title", "text"],
        term: words.join(" "),
        // Every word must be there, not any of them
        threshold: 0,
        tolerance: words.some((word) => word.length >= TYPO_FROM_LENGTH)
          ? 1
          : 0,
      });
      const hits: SearchHit[] = [];
      for (const { id } of result.hits) {
        const entry = entries.get(id as DayKey);
        const page = entry && `${entry.title}\n${entry.text}`;
        // The words as the page marks them: short words whole, a typo only in long ones
        if (
          entry &&
          page &&
          words.every((word) => matchRanges(page, word).length > 0)
        ) {
          const { text, ...hit } = entry;
          hits.push({ ...hit, snippet: searchSnippet(text, query) });
          if (hits.length > MAX_SEARCH_HITS) {
            break;
          }
        }
      }
      return hits;
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
