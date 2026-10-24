import { mkdir, readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { extname, resolve, sep } from "node:path";
import { app, BrowserWindow, dialog, shell } from "electron";
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
import { flushAllPages } from "../flush";
import { handle } from "../ipc";
import type { DeviceSettingsStore } from "../settings";
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

function broadcast(channel: string, ...args: unknown[]) {
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send(channel, ...args);
  }
}

/**
 * Opens the journal to the renderer. Everything it sends is checked here, since
 * the page is never trusted with the disk. The journal can be swapped for one in
 * another folder; returns a way to reach whichever is current.
 */
export function registerJournalIpc({
  open,
  onConfigChange,
  root: firstRoot,
  settings,
}: {
  /** A journal on the folder at `root`. */
  open: (root: string) => Journal;
  /** Called when the journal's preferences change: changed in Settings, or another journal opened. */
  onConfigChange: () => void;
  root: string;
  settings: DeviceSettingsStore;
}) {
  let journal = open(firstRoot);
  let watcher = watchJournal(journal.root, (days) =>
    broadcast(CHANNELS.journalChanged, days)
  );

  /** Moves to the journal in another folder; nothing in the old one is touched. */
  async function switchTo(root: string) {
    // Whatever is unsaved belongs to the journal it was written in
    await flushAllPages();
    await journal.flushCache();
    await watcher.close();
    journal = open(root);
    watcher = watchJournal(journal.root, (days) =>
      broadcast(CHANNELS.journalChanged, days)
    );
    // Its own preferences hold from now, whether or not the device remembers the move
    onConfigChange();
    await settings.write({ journalPath: journal.root });
    broadcast(CHANNELS.journalSwitched);
  }

  // Colours sampled in the last moment before quitting are written first
  let cacheSaved = false;
  app.on("will-quit", (event) => {
    if (cacheSaved) {
      return;
    }
    event.preventDefault();
    journal
      .flushCache()
      .catch((error) => console.error("Could not save flower colours", error))
      .finally(() => {
        cacheSaved = true;
        // On the next turn: called while Electron is still finishing this
        // will-quit, as when there was nothing to save, the quit is ignored and
        // the app is left running with no window
        setImmediate(() => app.quit());
      });
  });

  handle(CHANNELS.journalInfo, async () => ({
    config: await readConfig(journal.root),
    displayRoot: tildeHome(journal.root),
    root: journal.root,
    separator: sep,
  }));

  handle(CHANNELS.journalList, () => journal.listDays());

  handle(CHANNELS.journalStats, async () => ({
    bytes: await journal.diskUsage(),
  }));

  handle(CHANNELS.journalShow, async (_event, day) => {
    // An absent day may cross the bridge as null
    if (day !== undefined && day !== null) {
      shell.showItemInFolder(journal.dayFile(daySchema.parse(day)));
      return;
    }
    // Asked to see it: the folder is made if nothing has been written yet
    await mkdir(journal.root, { recursive: true });
    await shell.openPath(journal.root);
  });

  handle(CHANNELS.journalChange, async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
      return false;
    }
    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
      buttonLabel: "Use this folder",
      defaultPath: journal.root,
      properties: ["openDirectory", "createDirectory"],
      title: "Choose your journal folder",
    });
    const [chosen] = filePaths;
    if (canceled || !chosen || resolve(chosen) === journal.root) {
      return false;
    }
    await switchTo(resolve(chosen));
    return true;
  });

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

  handle(CHANNELS.journalSaveCover, (_event, day, image, extension, color) =>
    journal.saveCover(
      daySchema.parse(day),
      coverImageSchema.parse(image),
      coverExtensionSchema.parse(extension),
      flowerColorSchema.optional().parse(color)
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

  handle(CHANNELS.journalSetConfig, async (_event, changes) => {
    const config = await writeConfig(
      journal.root,
      configChangesSchema.parse(changes)
    );
    onConfigChange();
    return config;
  });

  return () => journal;
}
