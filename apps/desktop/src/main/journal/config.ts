import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import type { JournalConfigChanges } from "../../shared/channels";
import {
  type JournalConfig,
  MAX_NAME_LENGTH,
  REMINDER_TIME,
} from "../../shared/journal";
import { writeFileAtomic } from "./atomic-write";

/**
 * Reads the journal's preferences. A field that's missing or unusable takes its default; fields from a
 * newer version are kept when saving.
 */
const configSchema = z.looseObject({
  /** Whether a day sealed without a cover gets one from the gallery. */
  galleryCovers: z.boolean().catch(true),
  ghostPrompts: z.boolean().catch(true),
  name: z.string().trim().min(1).max(MAX_NAME_LENGTH).nullable().catch(null),
  reminder: z
    .object({
      enabled: z.boolean().catch(true),
      /** Local time, `HH:MM`. */
      time: z.string().regex(REMINDER_TIME).catch("21:00"),
    })
    .catch({ enabled: true, time: "21:00" }),
}) satisfies z.ZodType<JournalConfig>;

const DEFAULTS = configSchema.parse({});

/** Leaves out fields set to undefined, which mean "unchanged". */
function defined<T extends object>(changes: T) {
  return Object.fromEntries(
    Object.entries(changes).filter(([, value]) => value !== undefined)
  );
}

const configPath = (root: string) => join(root, ".daylily", "config.json");

/** The journal's preferences; defaults when the file isn't there or can't be read. */
export async function readConfig(root: string): Promise<JournalConfig> {
  let text: string;
  try {
    text = await readFile(configPath(root), "utf8");
  } catch {
    return DEFAULTS;
  }
  try {
    return configSchema.parse(JSON.parse(text));
  } catch {
    return DEFAULTS;
  }
}

// One change at a time, so two made together each build on the other
let writing: Promise<unknown> = Promise.resolve();

/**
 * What the journal remembers that isn't a preference: whether the Thoughts
 * screen's own notes were given. Kept with the journal, so a folder opened on
 * two computers gets them once.
 */
interface JournalMarks {
  thoughtsIntroduced?: boolean | undefined;
}

/** Whether the Thoughts screen's own notes were given in this journal. */
export async function thoughtsIntroduced(root: string): Promise<boolean> {
  try {
    const saved: unknown = JSON.parse(await readFile(configPath(root), "utf8"));
    return (
      typeof saved === "object" &&
      saved !== null &&
      "thoughtsIntroduced" in saved &&
      saved.thoughtsIntroduced === true
    );
  } catch {
    return false;
  }
}

/** Saves preferences over the current ones, keeping fields it doesn't know. */
export function writeConfig(
  root: string,
  changes: JournalConfigChanges & JournalMarks
): Promise<JournalConfig> {
  const write = writing.then(() => applyChanges(root, changes));
  writing = write.catch(() => undefined);
  return write;
}

async function applyChanges(
  root: string,
  changes: JournalConfigChanges & JournalMarks
): Promise<JournalConfig> {
  const current = await readConfig(root);
  const next = configSchema.parse({
    ...current,
    ...defined(changes),
    reminder: { ...current.reminder, ...defined(changes.reminder ?? {}) },
  });
  await writeFileAtomic(configPath(root), `${JSON.stringify(next, null, 2)}\n`);
  return next;
}
