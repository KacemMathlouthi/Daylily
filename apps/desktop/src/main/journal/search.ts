import type { DayKey } from "@daylily/core/day";
import { pageText } from "@daylily/core/excerpt";
import {
  matchRanges,
  queryWords,
  searchSnippet,
  TYPO_FROM_LENGTH,
} from "@daylily/core/search-text";
import { create, insert, remove, search } from "@orama/orama";
import {
  type DayHit,
  MAX_SEARCH_HITS,
  type SearchHit,
  type ThoughtHit,
} from "../../shared/journal";
import type { Journal } from "./store";

/** What a day's page or a thought is found by, beside what its result shows. */
type Entry =
  | (Omit<DayHit, "snippet"> & { text: string })
  | (Omit<ThoughtHit, "snippet"> & { text: string; title: "" });

/** Enough to read every day with thoughts in one go, as the index is built. */
const EVERY_DAY = Number.MAX_SAFE_INTEGER;

const newIndex = () =>
  create({ schema: { text: "string", title: "string" } as const });

/**
 * Full-text search over the journal, its pages and its thoughts, kept in
 * memory: built from the files the first time it's needed, then kept current as
 * days change on disk. Nothing leaves the computer, and nothing is written to
 * the journal.
 */
export function journalSearch(
  journal: Pick<
    Journal,
    "listDays" | "readDay" | "readThoughts" | "thoughtsPage"
  >
) {
  let index = newIndex();
  const entries = new Map<string, Entry>();
  /** Each day's entries, so a day read again replaces all of them. */
  const byDay = new Map<DayKey, string[]>();

  async function add(entry: Entry) {
    entries.set(entry.id, entry);
    byDay.set(entry.day, [...(byDay.get(entry.day) ?? []), entry.id]);
    await insert(index, { id: entry.id, text: entry.text, title: entry.title });
  }
  let building: Promise<void> | null = null;
  // Changes are indexed one batch at a time, so a day is never put twice at once
  let refreshing = Promise.resolve();

  /**
   * Reads a day again, its page and its thoughts, and indexes them as they now
   * are; what's gone or can't be read leaves.
   */
  async function put(day: DayKey) {
    const old = byDay.get(day) ?? [];
    for (const id of old) {
      entries.delete(id);
    }
    await Promise.all(old.map((id) => remove(index, id)));
    byDay.delete(day);
    const [read, thoughts] = await Promise.all([
      journal.readDay(day),
      journal.readThoughts(day),
    ]);
    if (read.ok && read.value) {
      const { color, cover, state, title } = read.value;
      const text = pageText(read.value.body);
      await add({
        color,
        cover,
        day,
        id: day,
        kind: "day",
        state,
        text,
        title,
      });
    }
    if (thoughts?.state === "ok") {
      await Promise.all(
        thoughts.thoughts.map((thought, place) =>
          add({
            day,
            id: `${day}#${place}`,
            index: place,
            kind: "thought",
            text: pageText(thought.body),
            time: thought.time,
            title: "",
          })
        )
      );
    }
  }

  async function build() {
    index = newIndex();
    entries.clear();
    byDay.clear();
    const [pages, thoughts] = await Promise.all([
      journal.listDays(),
      journal.thoughtsPage(null, EVERY_DAY),
    ]);
    const days = new Set([
      ...pages.flatMap((listed) =>
        listed.state === "unreadable" ? [] : [listed.day]
      ),
      ...thoughts.days.map((found) => found.day),
    ]);
    await Promise.all([...days].map(put));
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
    /**
     * Days whose title or page, and thoughts whose words, hold every word of
     * `query`, best first, up to one more than `MAX_SEARCH_HITS`.
     */
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
        const entry = entries.get(id);
        const page = entry && `${entry.title}\n${entry.text}`;
        // The words as the page marks them: short words whole, a typo only in long ones
        if (
          entry &&
          page &&
          words.every((word) => matchRanges(page, word).length > 0)
        ) {
          const snippet = searchSnippet(entry.text, query);
          if (entry.kind === "day") {
            const { text: _, ...hit } = entry;
            hits.push({ ...hit, snippet });
          } else {
            const { text: _, title: __, ...hit } = entry;
            hits.push({ ...hit, snippet });
          }
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
