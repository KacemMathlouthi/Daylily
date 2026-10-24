import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";
import { z } from "zod";
import type { DeviceState } from "../shared/journal";
import { writeFileAtomic } from "./journal/atomic-write";

/**
 * What belongs to this computer rather than the journal: where the journal is,
 * the theme, the sidebar. Each device keeps its own, in the app's data folder,
 * never in the journal. Read by the main process and handed to each window, as
 * the page's own storage can take seconds to open on Windows.
 */
const settingsSchema = z.looseObject({
  journalPath: z.string().refine(isAbsolute).nullable().catch(null),
  sidebarOpen: z.boolean().catch(true),
  theme: z.enum(["light", "dark", "system"]).catch("system"),
}) satisfies z.ZodType<DeviceState & { journalPath: string | null }>;

export type DeviceSettings = z.infer<typeof settingsSchema>;

/** Where a journal lives until onboarding lets people choose. */
export const DEFAULT_JOURNAL = join(homedir(), "Daylily");

export function deviceSettings(folder: string) {
  const path = join(folder, "settings.json");

  async function read(): Promise<DeviceSettings> {
    try {
      return settingsSchema.parse(JSON.parse(await readFile(path, "utf8")));
    } catch {
      return settingsSchema.parse({});
    }
  }

  return {
    /** The journal folder: the one chosen on this computer, or ~/Daylily. */
    async journalPath() {
      return (await read()).journalPath ?? DEFAULT_JOURNAL;
    },
    read,
    async write(changes: Partial<DeviceSettings>) {
      const next = settingsSchema.parse({ ...(await read()), ...changes });
      await writeFileAtomic(path, `${JSON.stringify(next, null, 2)}\n`);
      return next;
    },
  };
}
