import type { PageContent } from "@daylily/core/day-file";
import type { JournalError } from "../../../shared/journal";
import type { DayKey } from "./month";
import { createStore } from "./store";

/**
 * A save goes out half a second after the first change, and typing on doesn't
 * put it off: a crash loses at most that half second.
 */
const SAVE_AFTER_MS = 500;
/** After a failed save, how long before trying again. */
const RETRY_MS = 5000;

/** "unsaved" means changed since the last save, with a save on its way. */
export type SaveState =
  | { kind: "unsaved" }
  | { kind: "saved" }
  | { kind: "failed"; message: string };

const states = createStore<ReadonlyMap<DayKey, SaveState>>(new Map());
const timers = new Map<DayKey, ReturnType<typeof setTimeout>>();
const readers = new Map<DayKey, () => PageContent | null>();
// One save at a time, in order, so an older page never lands after a newer one
let writing: Promise<void> = Promise.resolve();

function setState(day: DayKey, state: SaveState) {
  states.set((current) => new Map(current).set(day, state));
}

/** Kind words for what went wrong, and whether trying again could help. */
function describe(error: JournalError) {
  switch (error.kind) {
    case "sealed":
      return {
        message: "This day is sealed, so it stays as it was.",
        retry: false,
      };
    case "not-writable":
      return {
        message: "This day has ended, so it can’t be started now.",
        retry: false,
      };
    case "malformed":
      return {
        message: "Today’s file can’t be read, so Daylily won’t write over it.",
        retry: false,
      };
    default:
      return {
        message:
          "Couldn’t save to your journal. Your words are still here, and Daylily will keep trying.",
        retry: true,
      };
  }
}

function retryLater(day: DayKey) {
  if (!timers.has(day)) {
    timers.set(
      day,
      setTimeout(() => save(day), RETRY_MS)
    );
  }
}

async function write(day: DayKey) {
  const page = readers.get(day)?.();
  if (!page) {
    return;
  }
  try {
    const result = await window.daylily.journal.write(day, page);
    if (!result.ok) {
      const { message, retry } = describe(result.error);
      setState(day, { kind: "failed", message });
      if (retry) {
        retryLater(day);
      }
      return;
    }
  } catch (error) {
    console.error("Could not save the page", error);
    setState(day, {
      kind: "failed",
      message: describe({ code: "", kind: "io" }).message,
    });
    retryLater(day);
    return;
  }
  // Changes made while it was writing are still waiting for their own save
  if (!timers.has(day)) {
    setState(day, { kind: "saved" });
  }
}

function save(day: DayKey) {
  clearTimeout(timers.get(day));
  timers.delete(day);
  writing = writing.then(() => write(day));
  return writing;
}

/** Notes that a day changed; `read` gives its latest content when the save goes out. */
export function scheduleSave(day: DayKey, read: () => PageContent | null) {
  readers.set(day, read);
  setState(day, { kind: "unsaved" });
  if (!timers.has(day)) {
    timers.set(
      day,
      setTimeout(() => save(day), SAVE_AFTER_MS)
    );
  }
}

/** Saves everything still waiting, now: on blur, before closing or sleeping. */
export async function flushSaves() {
  await Promise.all([...timers.keys()].map(save));
  await writing;
}

/** Records a day as matching its file, such as just after reading it. */
export function markSaved(day: DayKey) {
  setState(day, { kind: "saved" });
}

/** Where a day's saving stands; undefined before it has been read or changed. */
export function useSaveState(day: DayKey): SaveState | undefined {
  return states.use().get(day);
}

/** Starts over, as when the journal moves to another folder; anything unsaved was saved first. */
export function forgetSaves() {
  for (const timer of timers.values()) {
    clearTimeout(timer);
  }
  timers.clear();
  readers.clear();
  states.set(new Map());
}
