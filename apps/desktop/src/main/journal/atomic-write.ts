import { randomBytes } from "node:crypto";
import { mkdir, open, rename, rm } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

/** Marks our temp files, so one left by a crash is plainly ours. */
const TEMP_SUFFIX = ".daylily-tmp";

/** Windows refuses a rename while an antivirus or indexer briefly holds the file. */
const BUSY = new Set(["EACCES", "EBUSY", "EPERM"]);
const RENAME_TRIES = 5;
const RENAME_BACKOFF_MS = 50;

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

async function renameWithRetry(from: string, to: string, attempt = 1) {
  try {
    await rename(from, to);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code ?? "";
    if (attempt >= RENAME_TRIES || !BUSY.has(code)) {
      throw error;
    }
    await wait(RENAME_BACKOFF_MS * attempt);
    await renameWithRetry(from, to, attempt + 1);
  }
}

/** Flushes a folder's entry list, so a rename survives power loss. Not possible on Windows. */
async function syncFolder(folder: string) {
  if (process.platform === "win32") {
    return;
  }
  const handle = await open(folder, "r");
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

/**
 * Writes a file so it is either the old version or the new one, never half of
 * each: into a temp file beside it, flushed to disk, then renamed over it.
 * Missing folders are created.
 */
export async function writeFileAtomic(path: string, data: string | Uint8Array) {
  const folder = dirname(path);
  await mkdir(folder, { recursive: true });
  const temp = join(
    folder,
    `.${basename(path)}.${randomBytes(6).toString("hex")}${TEMP_SUFFIX}`
  );
  try {
    const handle = await open(temp, "wx");
    try {
      await handle.writeFile(data);
      await handle.sync();
    } finally {
      await handle.close();
    }
    await renameWithRetry(temp, path);
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
  await syncFolder(folder);
}
