import { type FSWatcher, watch } from "node:fs";
import { type DayKey, parseDayKey } from "@daylily/core/day";

/** `2026/10/21/…`, with either slash, as watchers report paths per platform. */
const DAY_FOLDER = /^(\d{4})[\\/](\d{2})[\\/](\d{2})(?:[\\/]|$)/;
/**
 * Changes come in bursts (a save is a temp file and a rename); report each burst
 * once. The temp file counts too: on Linux, Node notices a new file at once but
 * a file replaced in place only when it next polls, seconds later.
 */
const SETTLE_MS = 150;

/**
 * Watches the journal for changes made by any app, Daylily included, and reports
 * which days changed. The folder may not exist until the first save; `ensure`
 * starts watching once it does.
 */
export function watchJournal(root: string, onChange: (days: DayKey[]) => void) {
  let watcher: FSWatcher | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const changed = new Set<DayKey>();

  const report = () => {
    const days = [...changed].sort();
    changed.clear();
    if (days.length > 0) {
      onChange(days);
    }
  };

  const stop = () => {
    watcher?.close();
    watcher = null;
  };

  const ensure = () => {
    if (watcher) {
      return;
    }
    try {
      watcher = watch(root, { recursive: true }, (_event, name) => {
        const match = name ? DAY_FOLDER.exec(name) : null;
        const day = match && parseDayKey(`${match[1]}-${match[2]}-${match[3]}`);
        if (day) {
          changed.add(day);
          clearTimeout(timer);
          timer = setTimeout(report, SETTLE_MS);
        }
      });
      // The folder was moved or deleted; the next save starts watching again
      watcher.on("error", stop);
    } catch {
      // Not there yet: nothing has been written
    }
  };

  ensure();
  return {
    close() {
      clearTimeout(timer);
      stop();
    },
    ensure,
  };
}
