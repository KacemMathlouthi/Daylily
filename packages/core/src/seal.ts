import { type DayKey, dayEnd, dayOf } from "./day";
import {
  type DayFile,
  type DayFileError,
  readDayFile,
  updateFrontmatter,
} from "./day-file";
import { fail, type Result } from "./result";
import { isoWithOffset } from "./zone";

const LINE_BREAK = /\r\n?/g;
const TRAILING_SPACE = /[ \t]+$/gm;

/** Whether `day` has ended at `now` in `zone`, so it should be sealed. */
export function hasEnded(day: DayKey, now: Date, zone: string) {
  return day < dayOf(now, zone);
}

/**
 * When `day` sealed, as the file records it: its 4am boundary, with the offset of
 * the zone it was written in. A day sealed late, on the next launch, still gets
 * its boundary time.
 */
export function sealTime(day: DayKey, zone: string) {
  return isoWithOffset(dayEnd(day, zone), zone);
}

interface SealedContent {
  body: string;
  cover: string | null;
  title: string;
}

/**
 * The seal's fingerprint: sha256 over the JSON array `[title, cover, body]`, with
 * the body's line breaks as LF and trailing whitespace trimmed, so moving the
 * file between systems or adding fields never breaks it. Changing this format
 * marks every sealed day as edited.
 */
export async function sealHash({ body, cover, title }: SealedContent) {
  const page = body
    .replace(LINE_BREAK, "\n")
    .replace(TRAILING_SPACE, "")
    .trim();
  const canonical = JSON.stringify([title.trim(), cover ?? "", page]);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonical)
  );
  const hex = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return `sha256:${hex}`;
}

export interface Seal {
  /** The cover to give a day that has none, already copied into its folder. */
  cover: string | null;
  /** When it sealed, from `sealTime`. */
  sealed: string;
}

/**
 * Seals a day's file: its cover if it had none, the time and the hash. The page
 * itself is left byte for byte. A day already sealed is refused.
 */
export async function sealDayFile(
  text: string,
  seal: Seal
): Promise<Result<string, DayFileError>> {
  const day = readDayFile(text);
  if (!day.ok) {
    return day;
  }
  const { body, meta } = day.value;
  if (meta.sealed) {
    return fail({ kind: "sealed" });
  }
  const cover = meta.cover ?? seal.cover;
  const hash = await sealHash({ body, cover, title: meta.title });
  return updateFrontmatter(text, { cover, hash, sealed: seal.sealed });
}

/**
 * Where a day stands: still open, sealed as it was, or changed since by another
 * app. An edited day is only marked, never blocked or restored.
 */
export async function sealState({
  body,
  meta,
}: DayFile): Promise<"open" | "sealed" | "edited"> {
  if (!meta.sealed) {
    return "open";
  }
  const hash = await sealHash({ body, cover: meta.cover, title: meta.title });
  return hash === meta.hash ? "sealed" : "edited";
}
