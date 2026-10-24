import { readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { extname, sep } from "node:path";
import { app, BrowserWindow, dialog } from "electron";
import { CHANNELS } from "../../shared/channels";
import { COVER_EXTENSIONS, type CoverExtension } from "../../shared/journal";
import {
  configChangesSchema,
  coverExtensionSchema,
  coverImageSchema,
  coverStampSchema,
  daySchema,
  flowerColorSchema,
  pageSchema,
} from "../../shared/schemas";
import { handle } from "../ipc";
import { readConfig, writeConfig } from "./config";
import type { Journal } from "./store";
import { watchJournal } from "./watch";

/** Larger than any photo a phone takes; it keeps a stray video or scan out of memory. */
const MAX_COVER_BYTES = 30 * 1024 * 1024;

/** `/home/kacem/Daylily` as `~/Daylily`, the way people say where their files are. */
function tildeHome(path: string) {
  const home = homedir();
  return path === home || path.startsWith(`${home}${sep}`)
    ? `~${path.slice(home.length)}`
    : path;
}

function coverExtension(path: string): CoverExtension | null {
  const extension = extname(path).slice(1).toLowerCase();
  return COVER_EXTENSIONS.find((known) => known === extension) ?? null;
}

/**
 * Opens the journal to the renderer. Everything it sends is checked here, since
 * the page is never trusted with the disk.
 */
export function registerJournalIpc(journal: Journal) {
  const watcher = watchJournal(journal.root, (days) => {
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send(CHANNELS.journalChanged, days);
    }
  });

  handle(CHANNELS.journalInfo, async () => ({
    config: await readConfig(journal.root),
    displayRoot: tildeHome(journal.root),
    root: journal.root,
    separator: sep,
  }));

  handle(CHANNELS.journalList, () => journal.listDays());

  handle(CHANNELS.journalFlowerColor, (_event, day, stamp, color) =>
    journal.setFlowerColor(
      daySchema.parse(day),
      coverStampSchema.parse(stamp),
      flowerColorSchema.parse(color)
    )
  );

  handle(CHANNELS.journalRead, (_event, day) =>
    journal.readDay(daySchema.parse(day))
  );

  handle(CHANNELS.journalWrite, (_event, day, page) =>
    journal.writeDay(daySchema.parse(day), pageSchema.parse(page))
  );

  handle(CHANNELS.journalSaveCover, (_event, day, image, extension) =>
    journal.saveCover(
      daySchema.parse(day),
      coverImageSchema.parse(image),
      coverExtensionSchema.parse(extension)
    )
  );

  handle(CHANNELS.journalPickCover, async (event, rawDay) => {
    const day = daySchema.parse(rawDay);
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
      return null;
    }
    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
      defaultPath: app.getPath("pictures"),
      filters: [{ extensions: [...COVER_EXTENSIONS], name: "Images" }],
      properties: ["openFile"],
    });
    const [path] = filePaths;
    const extension = path ? coverExtension(path) : null;
    if (canceled || !path || !extension) {
      return null;
    }
    if ((await stat(path)).size > MAX_COVER_BYTES) {
      return { error: { code: "EFBIG", kind: "io" }, ok: false } as const;
    }
    return journal.saveCover(day, await readFile(path), extension);
  });

  handle(CHANNELS.journalSetConfig, (_event, changes) =>
    writeConfig(journal.root, configChangesSchema.parse(changes))
  );

  return watcher;
}
