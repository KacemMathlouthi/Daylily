import { randomBytes } from "node:crypto";
import { constants } from "node:fs";
import { copyFile, link, mkdir, open, rename, rm } from "node:fs/promises";
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

/** Writes `data` to a new temp file beside `path`, flushed to disk, and returns its path. */
async function writeTemp(path: string, data: string | Uint8Array) {
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
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
  return temp;
}

/**
 * Writes a file so it is either the old version or the new one, never half of
 * each: into a temp file beside it, flushed to disk, then renamed over it.
 * Missing folders are created.
 */
export async function writeFileAtomic(path: string, data: string | Uint8Array) {
  const temp = await writeTemp(path, data);
  try {
    await renameWithRetry(temp, path);
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
  await syncFolder(dirname(path));
}

/** Folders that can't hold hard links: FAT drives, some network shares. */
const NO_LINKS = new Set(["ENOSYS", "ENOTSUP", "EPERM", "EXDEV"]);

/**
 * Writes a new file, whole, only if nothing is at `path` yet, even should another
 * app make one at the same moment. Returns false, writing nothing, when one is.
 */
export async function createFileAtomic(
  path: string,
  data: string | Uint8Array
): Promise<boolean> {
  const temp = await writeTemp(path, data);
  try {
    // A hard link appears whole and refuses a name already taken
    await link(temp, path);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code ?? "";
    if (code === "EEXIST") {
      return false;
    }
    if (!NO_LINKS.has(code)) {
      throw error;
    }
    try {
      await copyFile(temp, path, constants.COPYFILE_EXCL);
    } catch (copyError) {
      if ((copyError as NodeJS.ErrnoException).code === "EEXIST") {
        return false;
      }
      throw copyError;
    }
  } finally {
    await rm(temp, { force: true });
  }
  await syncFolder(dirname(path));
  return true;
}
