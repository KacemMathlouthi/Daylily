import { relative } from "node:path";
import { type DayKey, parseDayKey } from "@daylily/core/day";
import { watch } from "chokidar";

/** `2026/10/21/…`, with either slash, as paths read per platform. */
const DAY_FOLDER = /^(\d{4})[\\/](\d{2})[\\/](\d{2})(?:[\\/]|$)/;
/** Changes come in bursts (a save is a temp file and a rename); report each burst once. */
const SETTLE_MS = 150;
/** Year, month, day, then the day's own files: nothing deeper is part of the journal. */
const DAY_DEPTH = 3;

/**
 * Watches the journal for changes made by any app, Daylily included, and reports
 * which days changed. The folder may not exist until the first save; it is
 * picked up when it appears.
 */
export function watchJournal(root: string, onChange: (days: DayKey[]) => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const changed = new Set<DayKey>();

  const report = () => {
    const days = [...changed].sort();
    changed.clear();
    if (days.length > 0) {
      onChange(days);
    }
  };

  // One watch per folder rather than Node's recursive mode, which on Linux can
  // miss changes in folders made just before it started
  const watcher = watch(root, { depth: DAY_DEPTH, ignoreInitial: true });
  watcher.on("all", (_event, path) => {
    const match = DAY_FOLDER.exec(relative(root, path));
    const day = match && parseDayKey(`${match[1]}-${match[2]}-${match[3]}`);
    if (day) {
      changed.add(day);
      clearTimeout(timer);
      timer = setTimeout(report, SETTLE_MS);
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
