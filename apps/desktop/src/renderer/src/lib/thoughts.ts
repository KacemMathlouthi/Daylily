import { type Thought, thoughtTime } from "@daylily/core/thoughts-file";
import { useMemo } from "react";
import type { ThoughtDay } from "../../../shared/journal";
import { hasUnsavedChanges, markSaved, scheduleSave } from "./autosave";
import type { DayKey } from "./month";
import { createStore } from "./store";

/**
 * A thought as the screen holds it. `begun` is false for the open thought at the
 * top, until its first word: only then does it take its time and go to the file.
 */
export interface ShownThought {
  begun: boolean;
  body: string;
  id: string;
  /** `HH:MM`; null for text written above a day's first thought in another app. */
  time: string | null;
}

interface ThoughtsOfDay {
  day: DayKey;
  /** A file that can't be read is shown as nothing, and never written over. */
  state: "ok" | "unreadable";
  thoughts: ShownThought[];
}

/** One entry on the screen: a thought and its day, or a day whose file can't be read. */
export type ThoughtEntry =
  | { day: DayKey; kind: "thought"; thought: ShownThought }
  | { day: DayKey; kind: "unreadable" };

const days = createStore<ReadonlyMap<DayKey, ThoughtsOfDay>>(new Map());
/** The thought to put the cursor in next, as after ⌘ Enter. */
const focusing = createStore<string | null>(null);
/**
 * The earliest day the screen has read so far: a day changed on disk before it
 * waits to be paged in. Null until the first page; "" once every day is in.
 */
const readBack = createStore<DayKey | null>(null);

let lastId = 0;
const newId = () => {
  lastId += 1;
  return `thought-${lastId}`;
};

const saveKey = (day: DayKey) => `thoughts:${day}`;

function setDay(
  day: DayKey,
  change: (current: ThoughtsOfDay) => ThoughtsOfDay
) {
  days.set((current) => {
    const existing = current.get(day) ?? {
      day,
      state: "ok",
      thoughts: [],
    };
    return new Map(current).set(day, change(existing));
  });
}

/** What goes in the day's file: every thought begun, in the order written. */
function forFile(day: ThoughtsOfDay): Thought[] {
  return day.thoughts
    .filter((thought) => thought.begun)
    .map(({ body, time }) => ({ body, time }));
}

function save(day: DayKey) {
  scheduleSave(saveKey(day), () => {
    const current = days.get().get(day);
    return current?.state === "ok"
      ? window.daylily.thoughts.write(day, forFile(current))
      : null;
  });
}

/** Whether the screen already holds what the file says, as after Daylily's own save. */
function matches(current: ThoughtsOfDay, thoughts: Thought[]) {
  const held = forFile(current).filter((thought) => thought.body.trim() !== "");
  return (
    current.state === "ok" &&
    held.length === thoughts.length &&
    held.every(
      (thought, index) =>
        thought.time === thoughts[index]?.time &&
        thought.body.trim() === thoughts[index]?.body.trim()
    )
  );
}

/**
 * Takes a day's thoughts as read from its file: from a page as the screen
 * scrolls back, or after another app changed it. A day with words of its own
 * still to save keeps them; they win as they're written.
 */
export function receiveThoughts(found: ThoughtDay) {
  const { day } = found;
  if (hasUnsavedChanges(saveKey(day))) {
    return;
  }
  const current = days.get().get(day);
  if (found.state === "unreadable") {
    setDay(day, (held) => ({ ...held, state: "unreadable", thoughts: [] }));
    return;
  }
  if (current && matches(current, found.thoughts)) {
    return;
  }
  // The open thought, if it's still waiting for its first word, stays where it is
  // Each thought read gets a new id, so its editor opens afresh on the file's words
  const open = current?.thoughts.filter((thought) => !thought.begun) ?? [];
  setDay(day, (held) => ({
    ...held,
    state: "ok",
    thoughts: [
      ...found.thoughts.map((thought) => ({
        ...thought,
        begun: true,
        id: newId(),
      })),
      ...open,
    ],
  }));
  markSaved(saveKey(day));
}

/** A day whose thoughts file is gone, perhaps deleted in another app. */
export function forgetThoughtsOf(day: DayKey) {
  if (hasUnsavedChanges(saveKey(day)) || !days.get().has(day)) {
    return;
  }
  setDay(day, (held) => ({
    ...held,
    // Gone, it's no longer a file that can't be read
    state: "ok",
    thoughts: held.thoughts.filter((thought) => !thought.begun),
  }));
}

/** Notes how far back the screen has read: to `day`, or every day once `done`. */
export function readBackTo(day: DayKey | null, done: boolean) {
  readBack.set(done ? "" : day);
}

/** Whether every day with thoughts has been read and taken in. */
export function useAllRead() {
  return readBack.use() === "";
}

/** Whether a day changed on disk is one the screen shows, so it should be read again. */
export function showsThoughtsOf(day: DayKey) {
  const back = readBack.get();
  return days.get().has(day) || (back !== null && day >= back);
}

/** Today's open thought at the top, waiting for a first word; made if it isn't there. */
function openThought(today: DayKey) {
  const last = days.get().get(today)?.thoughts.at(-1);
  if (last && !last.begun) {
    return last.id;
  }
  const id = newId();
  setDay(today, (held) => ({
    ...held,
    thoughts: [...held.thoughts, { begun: false, body: "", id, time: null }],
  }));
  return id;
}

/** Makes sure today has its open thought at the top, without taking the cursor. */
export function keepOpenThought(today: DayKey) {
  openThought(today);
}

/**
 * ⌘ Enter: on to a new thought at the top. If the open one has nothing in it
 * yet, the cursor just goes there.
 */
export function startNextThought(today: DayKey) {
  focusing.set(openThought(today));
}

/** A thought changed. The open one takes its time with its first word. */
export function changeThought(
  day: DayKey,
  id: string,
  body: string,
  now: Date
) {
  setDay(day, (held) => ({
    ...held,
    thoughts: held.thoughts.map((thought) => {
      if (thought.id !== id) {
        return thought;
      }
      const begins = !thought.begun && body.trim() !== "";
      return {
        ...thought,
        begun: thought.begun || begins,
        body,
        time: begins
          ? thoughtTime(now, Intl.DateTimeFormat().resolvedOptions().timeZone)
          : thought.time,
      };
    }),
  }));
  if (
    days
      .get()
      .get(day)
      ?.thoughts.some((thought) => thought.id === id && thought.begun)
  ) {
    save(day);
  }
}

/** A thought emptied and left goes from the screen, as it already has from the file. */
export function leaveThought(day: DayKey, id: string, today: DayKey) {
  const thought = days
    .get()
    .get(day)
    ?.thoughts.find((each) => each.id === id);
  if (!thought?.begun || thought.body.trim() !== "") {
    return;
  }
  setDay(day, (held) => ({
    ...held,
    thoughts: held.thoughts.filter((each) => each.id !== id),
  }));
  save(day);
  // Today always keeps a thought to write in, even once every other is gone
  if (day === today) {
    openThought(today);
  }
}

/**
 * The thought at `place` among a day's, in the order written, as search names
 * it; undefined while the day isn't read yet.
 */
export function thoughtAt(day: DayKey, place: number) {
  return days
    .get()
    .get(day)
    ?.thoughts.filter((thought) => thought.begun)[place]?.id;
}

/** The thought that should take the cursor, once, and a way to say it has. */
export function useFocusing() {
  return [focusing.use(), () => focusing.set(null)] as const;
}

function entriesOf(
  held: ReadonlyMap<DayKey, ThoughtsOfDay>,
  today: DayKey
): ThoughtEntry[] {
  return [...held.values()]
    .sort((a, b) => (a.day < b.day ? 1 : -1))
    .flatMap((day): ThoughtEntry[] =>
      day.state === "unreadable"
        ? [{ day: day.day, kind: "unreadable" }]
        : day.thoughts
            .filter((thought) => thought.begun || day.day === today)
            .reverse()
            .map((thought) => ({ day: day.day, kind: "thought", thought }))
    );
}

/** Every thought on the screen as it is now, newest first. */
export function thoughtEntries(today: DayKey) {
  return entriesOf(days.get(), today);
}

/**
 * Every thought on the screen, newest first: days newest first and each day's
 * thoughts from its last. Only today shows the thought waiting for its first word.
 */
export function useThoughtEntries(today: DayKey): ThoughtEntry[] {
  const held = days.use();
  return useMemo(() => entriesOf(held, today), [held, today]);
}

/** Starts over, as when the journal moves to another folder; anything unsaved was saved first. */
export function forgetThoughts() {
  days.set(new Map());
  focusing.set(null);
  readBack.set(null);
}

/** How many of a day's thoughts are kept, for the status bar. */
export function useThoughtCount(day: DayKey) {
  const held = days.use().get(day);
  return (
    held?.thoughts.filter(
      (thought) => thought.begun && thought.body.trim() !== ""
    ).length ?? 0
  );
}

export { saveKey as thoughtsSaveKey };
