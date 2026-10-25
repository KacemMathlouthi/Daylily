import { constants } from "node:fs";
import { access, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, sep } from "node:path";
import type { FolderInfo } from "../../shared/journal";
import { readConfig } from "./config";
import type { Journal } from "./store";

/** `/home/kacem/Daylily` as `~/Daylily`, the way people say where their files are. */
export function tildeHome(path: string, home = homedir()) {
  return path === home || path.startsWith(`${home}${sep}`)
    ? `~${path.slice(home.length)}`
    : path;
}

/**
 * Whether Daylily could make and write files in `path`: a folder it can write
 * in, or, when it isn't there yet, the nearest folder above that will hold it.
 */
async function canWrite(path: string): Promise<boolean> {
  try {
    if (!(await stat(path)).isDirectory()) {
      return false;
    }
  } catch {
    const parent = dirname(path);
    return parent !== path && canWrite(parent);
  }
  try {
    await access(path, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * A folder as a choice of journal: the days already written there, whether it
 * can be written, and its preferences. Looking changes nothing on disk.
 */
export async function inspectFolder(
  journal: Pick<Journal, "listDays" | "root">
): Promise<FolderInfo> {
  const [days, writable, config] = await Promise.all([
    journal.listDays().catch(() => []),
    canWrite(journal.root),
    readConfig(journal.root),
  ]);
  return {
    config,
    days: days.length,
    displayPath: tildeHome(journal.root),
    path: journal.root,
    writable,
  };
}
