import type { Result } from "@daylily/core/result";
import type { JournalError } from "../../../shared/journal";
import { createStore } from "./store";

/**
 * A save goes out half a second after the first change, and typing on doesn't
 * put it off: a crash loses at most that half second.
 */
const SAVE_AFTER_MS = 500;
/** After a failed save, how long before trying again. */
const RETRY_MS = 5000;

/**
 * What a save is for: a day's page under its day, or its thoughts under
 * `thoughts:` and the day. Each saves on its own.
 */
type SaveKey = string;

/** Writes the latest content, or null when there's nothing to write. */
type Writer = () => Promise<Result<unknown, JournalError>> | null;

/** "unsaved" means changed since the last save, with a save on its way. */
export type SaveState =
  | { kind: "unsaved" }
  | { kind: "saved" }
  | { kind: "failed"; message: string };

const states = createStore<ReadonlyMap<SaveKey, SaveState>>(new Map());
const timers = new Map<SaveKey, ReturnType<typeof setTimeout>>();
const writers = new Map<SaveKey, Writer>();
// One save at a time, in order, so an older page never lands after a newer one
let writing: Promise<void> = Promise.resolve();

function setState(key: SaveKey, state: SaveState) {
  states.set((current) => new Map(current).set(key, state));
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
        message: "This file can’t be read, so Daylily won’t write over it.",
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

function retryLater(key: SaveKey) {
  if (!timers.has(key)) {
    timers.set(
      key,
      setTimeout(() => save(key), RETRY_MS)
    );
  }
}

async function write(key: SaveKey) {
  const writer = writers.get(key);
  if (!writer) {
    return;
  }
  try {
    const pending = writer();
    if (pending === null) {
      return;
    }
    const result = await pending;
    if (!result.ok) {
      const { message, retry } = describe(result.error);
      setState(key, { kind: "failed", message });
      if (retry) {
        retryLater(key);
      }
      return;
    }
  } catch (error) {
    console.error("Could not save", error);
    setState(key, {
      kind: "failed",
      message: describe({ code: "", kind: "io" }).message,
    });
    retryLater(key);
    return;
  }
  // Changes made while it was writing are still waiting for their own save
  if (!timers.has(key)) {
    setState(key, { kind: "saved" });
  }
}

function save(key: SaveKey) {
  clearTimeout(timers.get(key));
  timers.delete(key);
  writing = writing.then(() => write(key));
  return writing;
}

/** Notes that something changed; `writer` writes its latest content when the save goes out. */
export function scheduleSave(key: SaveKey, writer: Writer) {
  writers.set(key, writer);
  setState(key, { kind: "unsaved" });
  if (!timers.has(key)) {
    timers.set(
      key,
      setTimeout(() => save(key), SAVE_AFTER_MS)
    );
  }
}

/** Saves everything still waiting, now: on blur, before closing or sleeping. */
export async function flushSaves() {
  await Promise.all([...timers.keys()].map(save));
  await writing;
}

/** Whether something has changes of its own not yet safely in its file. */
export function hasUnsavedChanges(key: SaveKey) {
  const state = states.get().get(key);
  return timers.has(key) || (state !== undefined && state.kind !== "saved");
}

/** Records something as matching its file, such as just after reading it. */
export function markSaved(key: SaveKey) {
  setState(key, { kind: "saved" });
}

/** Where a day's saving stands; undefined before it has been read or changed. */
export function useSaveState(key: SaveKey): SaveState | undefined {
  return states.use().get(key);
}

/** Starts over, as when the journal moves to another folder; anything unsaved was saved first. */
export function forgetSaves() {
  for (const timer of timers.values()) {
    clearTimeout(timer);
  }
  timers.clear();
  writers.clear();
  states.set(new Map());
}
