import { readFile, rm, rmdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  journalFolder,
  manifestPath,
  type SeedManifest,
  sha256,
} from "./seed-manifest";

/**
 * Takes back what `journal:seed` added: only files still exactly as the seed
 * wrote them. A file someone changed since is kept, and so is everything else.
 */

const journal = journalFolder();
let manifest: SeedManifest;
try {
  manifest = JSON.parse(await readFile(manifestPath(journal), "utf8"));
} catch {
  console.log(`Nothing was seeded in ${journal}.`);
  process.exit(0);
}

async function removeIfUnchanged({
  path,
  sha256: expected,
}: SeedManifest["files"][number]) {
  const file = join(journal, ...path.split("/"));
  let data: Buffer;
  try {
    data = await readFile(file);
  } catch {
    return "gone";
  }
  if (sha256(data) !== expected) {
    return "changed";
  }
  await rm(file);
  return "removed";
}

/** One at a time, so a day's folder is gone before its month is tried. */
async function removeInOrder([folder, ...rest]: string[]): Promise<void> {
  if (folder === undefined) {
    return;
  }
  try {
    await rmdir(folder);
  } catch {
    // It still holds something, which is what keeps it
  }
  await removeInOrder(rest);
}

/** Removes the day, month and year folders the seed left empty, deepest first. */
async function removeEmptyFolders(paths: string[]) {
  const folders = new Set<string>();
  for (const path of paths) {
    let folder = dirname(join(journal, ...path.split("/")));
    while (folder.startsWith(journal) && folder !== journal) {
      folders.add(folder);
      folder = dirname(folder);
    }
  }
  const deepestFirst = [...folders].sort((a, b) => b.length - a.length);
  await removeInOrder(deepestFirst);
}

const results = await Promise.all(manifest.files.map(removeIfUnchanged));
await removeEmptyFolders(manifest.files.map((file) => file.path));
await rm(manifestPath(journal));
// The seed may have made .daylily just for its manifest
await rmdir(dirname(manifestPath(journal))).catch(() => undefined);

const kept = manifest.files.filter((_, index) => results[index] === "changed");
console.log(
  `Removed ${results.filter((result) => result === "removed").length} seeded files from ${journal}.`
);
for (const file of kept) {
  console.log(`Kept ${file.path}: it changed after seeding.`);
}
