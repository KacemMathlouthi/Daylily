import { type DayKey, parseDayKey } from "@daylily/core/day";
import {
  DAY_ASSET_NAME,
  JOURNAL_SCHEME,
  PAGE_IMAGE_NAME,
} from "../../shared/journal";

/** A file the page may load: one in a day's folder, or an image in `notes/images`. */
export type JournalAsset =
  | { day: DayKey; kind: "day"; name: string }
  | { kind: "note"; name: string };

/** The one file name a URL's path holds, decoded, or null for a deeper path. */
function fileName(segments: string[]) {
  const [encoded = "", ...rest] = segments;
  if (rest.length > 0) {
    return null;
  }
  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}

/**
 * The file a journal URL names, like `daylily-journal://day/2026-10-21/cover.jpg`
 * or `daylily-journal://note/image-01.png`, or null for anything else: other
 * files, other folders, other schemes.
 */
export function parseAssetUrl(url: string): JournalAsset | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== `${JOURNAL_SCHEME}:`) {
    return null;
  }
  const [, ...segments] = parsed.pathname.split("/");
  if (parsed.hostname === "note") {
    const name = fileName(segments);
    return name !== null && PAGE_IMAGE_NAME.test(name)
      ? { kind: "note", name }
      : null;
  }
  if (parsed.hostname !== "day") {
    return null;
  }
  const [dayText = "", ...rest] = segments;
  const day = parseDayKey(dayText);
  const name = fileName(rest);
  return day && name !== null && DAY_ASSET_NAME.test(name)
    ? { day, kind: "day", name }
    : null;
}
