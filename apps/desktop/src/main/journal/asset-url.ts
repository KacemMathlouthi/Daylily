import { type DayKey, parseDayKey } from "@daylily/core/day";
import { JOURNAL_SCHEME } from "../../shared/journal";

/** The only files the page may load from the journal: a day's cover and images. */
const ASSET_NAME = /^(?:cover|image-\d{2,3})\.(?:avif|gif|jpeg|jpg|png|webp)$/;

/**
 * The day and file a journal URL names, like `daylily-journal://day/2026-10-21/cover.jpg`,
 * or null for anything else: other files, other folders, other schemes.
 */
export function parseAssetUrl(
  url: string
): { day: DayKey; name: string } | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== `${JOURNAL_SCHEME}:` || parsed.hostname !== "day") {
    return null;
  }
  const [, dayText = "", encoded = "", ...rest] = parsed.pathname.split("/");
  const day = parseDayKey(dayText);
  if (!day || rest.length > 0) {
    return null;
  }
  let name: string;
  try {
    name = decodeURIComponent(encoded);
  } catch {
    return null;
  }
  return ASSET_NAME.test(name) ? { day, name } : null;
}
