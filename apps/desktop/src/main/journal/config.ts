import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import type { JournalConfig } from "../../shared/journal";
import { writeFileAtomic } from "./atomic-write";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Reads the journal's preferences. A field that's missing or unusable takes its default; fields from a
 * newer version are kept when saving.
 */
const configSchema = z.looseObject({
  /** Whether a day sealed without a cover gets one from the gallery. */
  galleryCovers: z.boolean().catch(true),
  ghostPrompts: z.boolean().catch(true),
  reminder: z
    .object({
      enabled: z.boolean().catch(true),
      /** Local time, `HH:MM`. */
      time: z.string().regex(TIME).catch("21:00"),
    })
    .catch({ enabled: true, time: "21:00" }),
}) satisfies z.ZodType<JournalConfig>;

export type ConfigChanges = Partial<Omit<JournalConfig, "reminder">> & {
  reminder?: Partial<JournalConfig["reminder"]>;
};

const DEFAULTS = configSchema.parse({});

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

/** Saves preferences over the current ones, keeping fields it doesn't know. */
export async function writeConfig(
  root: string,
  changes: ConfigChanges
): Promise<JournalConfig> {
  const current = await readConfig(root);
  const next = configSchema.parse({
    ...current,
    ...changes,
    reminder: { ...current.reminder, ...changes.reminder },
  });
  await writeFileAtomic(configPath(root), `${JSON.stringify(next, null, 2)}\n`);
  return next;
}
