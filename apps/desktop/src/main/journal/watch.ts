import { relative } from "node:path";
import { type DayKey, parseDayKey } from "@daylily/core/day";
import { isNoteName, NOTES_FOLDER } from "@daylily/core/note-file";
import { watch } from "chokidar";

/** `2026/10/21/…`, with either slash, as paths read per platform. */
const DAY_FOLDER = /^(\d{4})[\\/](\d{2})[\\/](\d{2})(?:[\\/]|$)/;
/** `notes/books.md`, a note directly in the notes folder. */
const NOTE_FILE = new RegExp(`^${NOTES_FOLDER}[\\\\/]([^\\\\/]+)$`);
/** Changes come in bursts (a save is a temp file and a rename); report each burst once. */
const SETTLE_MS = 150;
/** Year, month, day, then the day's own files: nothing deeper is part of the journal. */
const DAY_DEPTH = 3;

/** What changed in the journal: days by their key, notes by their file's name. */
export interface JournalChanges {
  days: DayKey[];
  notes: string[];
}

/**
 * Watches the journal for changes made by any app, Daylily included, and reports
 * which days and notes changed. The folder may not exist until the first save;
 * it is picked up when it appears.
 */
export function watchJournal(
  root: string,
  onChange: (changes: JournalChanges) => void
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const changedDays = new Set<DayKey>();
  const changedNotes = new Set<string>();

  const report = () => {
    const days = [...changedDays].sort();
    const notes = [...changedNotes].sort();
    changedDays.clear();
    changedNotes.clear();
    if (days.length > 0 || notes.length > 0) {
      onChange({ days, notes });
    }
  };
  const settle = () => {
    clearTimeout(timer);
    timer = setTimeout(report, SETTLE_MS);
  };

  // One watch per folder rather than Node's recursive mode, which on Linux can
  // miss changes in folders made just before it started
  const watcher = watch(root, { depth: DAY_DEPTH, ignoreInitial: true });
  watcher.on("all", (_event, path) => {
    const inside = relative(root, path);
    const match = DAY_FOLDER.exec(inside);
    const day = match && parseDayKey(`${match[1]}-${match[2]}-${match[3]}`);
    const note = NOTE_FILE.exec(inside)?.[1];
    if (day) {
      changedDays.add(day);
      settle();
    } else if (note && isNoteName(note)) {
      changedNotes.add(note);
      settle();
    }
  });
  const ready = new Promise<void>((resolve) => {
    watcher.once("ready", () => resolve());
  });

  return {
    async close() {
      clearTimeout(timer);
      await watcher.close();
    },
    /** Resolves once the folders that exist are being watched. */
    ready,
  };
}
