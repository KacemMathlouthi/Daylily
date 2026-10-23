import { createHash } from "node:crypto";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { DEFAULT_JOURNAL } from "../src/main/settings";

/** What the seed wrote, so unseeding removes exactly that and nothing a person made. */
export interface SeedManifest {
  /** Each file, relative to the journal, with a fingerprint of what was written. */
  files: { path: string; sha256: string }[];
  seeded: string;
}

export const sha256 = (data: string | Uint8Array) =>
  createHash("sha256").update(data).digest("hex");

/** The journal to work on: `--journal <folder>`, or ~/Daylily as the app uses. */
export function journalFolder() {
  const { values } = parseArgs({ options: { journal: { type: "string" } } });
  return resolve(values.journal ?? DEFAULT_JOURNAL);
}

export const manifestPath = (journal: string) =>
  join(journal, ".daylily", "seed.json");
