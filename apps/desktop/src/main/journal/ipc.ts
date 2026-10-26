import { mkdir, readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fail, ok, type Result } from "@daylily/core/result";
import { app, BrowserWindow, dialog, shell } from "electron";
import { CHANNELS } from "../../shared/channels";
import {
  COVER_EXTENSIONS,
  type CoverExtension,
  type ImageError,
  type JournalError,
  MAX_IMAGE_BYTES,
  THOUGHT_DAYS_PER_PAGE,
} from "../../shared/journal";
import {
  configChangesSchema,
  coverExtensionSchema,
  coverStampSchema,
  daySchema,
  flowerColorSchema,
  folderPathSchema,
  imageBytesSchema,
  imageOwnerSchema,
  noteNameSchema,
  noteSchema,
  pageSchema,
  searchQuerySchema,
  thoughtsSchema,
} from "../../shared/schemas";
import { flushAllPages } from "../flush";
import { handle } from "../ipc";
import type { DeviceSettingsStore } from "../settings";
import { readConfig, thoughtsIntroduced, writeConfig } from "./config";
import { inspectFolder, tildeHome } from "./folder";
import { imageKind } from "./image-kind";
import { journalSearch } from "./search";
import type { Journal } from "./store";
import { introductionThoughts } from "./thoughts-intro";
import { watchJournal } from "./watch";

/** Long enough for the app to have opened; the search index is built after it. */
const WARM_SEARCH_AFTER_MS = 3000;

function coverExtension(path: string): CoverExtension | null {
  const extension = extname(path).slice(1).toLowerCase();
  return COVER_EXTENSIONS.find((known) => known === extension) ?? null;
}

/** An image the page sent, checked by its bytes: what it is, or why it isn't one. */
function checkImage(
  image: unknown
): Result<{ bytes: Uint8Array; extension: CoverExtension }, ImageError> {
  // An empty file is no image either, rather than a broken request
  if (image instanceof Uint8Array && image.byteLength === 0) {
    return fail({ heic: false, kind: "not-an-image" });
  }
  const bytes = imageBytesSchema.parse(image);
  const found = imageKind(bytes);
  if (found.kind !== "image") {
    return fail({ heic: found.kind === "heic", kind: "not-an-image" });
  }
  return ok({ bytes, extension: found.extension });
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
  let search = journalSearch(journal);

  /** Builds the index in the quiet after opening, so the first search answers at once. */
  let warming: ReturnType<typeof setTimeout> | undefined;
  const warmSoon = () => {
    // A journal left before its index was built never builds it
    clearTimeout(warming);
    warming = setTimeout(() => {
      search
        .warm()
        .catch((error) => console.error("Could not build search", error));
    }, WARM_SEARCH_AFTER_MS);
  };
  warmSoon();

  /** Tells the page which days and notes changed, and keeps search in step with them. */
  const watch = () =>
    watchJournal(journal.root, (changes) => {
      if (changes.days.length > 0) {
        broadcast(CHANNELS.journalChanged, changes.days);
      }
      if (changes.notes.length > 0) {
        broadcast(CHANNELS.notesChanged, changes.notes);
      }
      search
        .refresh(changes)
        .catch((error) => console.error("Could not update search", error));
    });
  let watcher = watch();

  /** Moves to the journal in another folder; nothing in the old one is touched. */
  async function switchTo(root: string) {
    // Whatever is unsaved belongs to the journal it was written in
    await flushAllPages();
    await journal.flushCache();
    await watcher.close();
    journal = open(root);
    search = journalSearch(journal);
    warmSoon();
    watcher = watch();
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
        // On the next turn: Electron ignores app.quit() called before this
        // will-quit has finished, which happens when there was nothing to save,
        // and the app would be left running with no window
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

  /** Asks for a folder from the window that asked; null if cancelled. */
  async function askForFolder(sender: Electron.WebContents) {
    const window = BrowserWindow.fromWebContents(sender);
    if (!window) {
      return null;
    }
    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
      buttonLabel: "Use this folder",
      defaultPath: journal.root,
      properties: ["openDirectory", "createDirectory"],
      title: "Choose your journal folder",
    });
    const [chosen] = filePaths;
    return canceled || !chosen ? null : resolve(chosen);
  }

  handle(CHANNELS.journalChange, async (event) => {
    const chosen = await askForFolder(event.sender);
    if (!chosen || chosen === journal.root) {
      return false;
    }
    await switchTo(chosen);
    return true;
  });

  /**
   * The folders offered to the page while choosing one: the journal's own and
   * those picked in the dialog. The page may move the journal to these only,
   * never to a path it made up.
   */
  const offered = new Set<string>();
  const offer = (root: string) => {
    offered.add(root);
    return inspectFolder(root === journal.root ? journal : open(root));
  };

  handle(CHANNELS.journalFolder, () => offer(journal.root));

  handle(CHANNELS.journalPickFolder, async (event) => {
    const chosen = await askForFolder(event.sender);
    return chosen ? offer(chosen) : null;
  });

  handle(CHANNELS.journalUse, async (_event, path) => {
    const root = folderPathSchema.parse(path);
    if (!offered.has(root)) {
      throw new Error(`Refused a journal folder Daylily didn't offer: ${root}`);
    }
    if (root !== journal.root) {
      await switchTo(root);
    }
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
      imageBytesSchema.parse(image),
      coverExtensionSchema.parse(extension),
      flowerColorSchema.optional().parse(color)
    )
  );

  handle<Result<string, ImageError>>(
    CHANNELS.journalAddImage,
    (_event, day, image, owner) => {
      const checked = checkImage(image);
      return checked.ok
        ? journal.addImage(
            daySchema.parse(day),
            checked.value.bytes,
            checked.value.extension,
            imageOwnerSchema.optional().parse(owner ?? undefined)
          )
        : checked;
    }
  );

  handle<Result<string, ImageError>>(
    CHANNELS.notesAddImage,
    (_event, image) => {
      const checked = checkImage(image);
      return checked.ok
        ? journal.addNoteImage(checked.value.bytes, checked.value.extension)
        : checked;
    }
  );

  handle(CHANNELS.notesList, () => journal.listNotes());

  handle(CHANNELS.notesRead, (_event, name) =>
    journal.readNote(noteNameSchema.parse(name))
  );

  handle(CHANNELS.notesWrite, (_event, name, note, rename) =>
    journal.writeNote(
      name === null ? null : noteNameSchema.parse(name),
      noteSchema.parse(note),
      { rename: rename === true }
    )
  );

  handle(CHANNELS.notesShow, (_event, name) => {
    shell.showItemInFolder(journal.noteFile(noteNameSchema.parse(name)));
  });

  handle<Result<void, JournalError>>(
    CHANNELS.notesTrash,
    async (_event, name) => {
      try {
        await shell.trashItem(journal.noteFile(noteNameSchema.parse(name)));
        return ok(undefined);
      } catch (error) {
        // No Trash to put it in, as on some Linux setups: the file stays where it is
        console.error("Could not move a note to the Trash", error);
        return fail({ code: "ENOTRASH", kind: "io" });
      }
    }
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
    if ((await stat(path)).size > MAX_IMAGE_BYTES) {
      return { error: { code: "EFBIG", kind: "io" }, ok: false } as const;
    }
    return journal.saveCover(day, await readFile(path), extension);
  });

  handle(CHANNELS.journalSearch, (_event, query) =>
    search.find(searchQuerySchema.parse(query))
  );

  /**
   * Gives the Thoughts screen's own notes the first time a journal's thoughts
   * are listed, rather than as it opens, so a folder only looked at during
   * onboarding is left as it was. Once per journal, remembered in its config.
   */
  const introducing = new Map<string, Promise<void>>();
  function introduceThoughts(current: Journal) {
    const running = introducing.get(current.root);
    if (running) {
      return running;
    }
    const introduction = (async () => {
      if (await thoughtsIntroduced(current.root)) {
        return;
      }
      const added = await current.addThoughts((time) =>
        introductionThoughts(process.platform, time)
      );
      if (added.ok) {
        await writeConfig(current.root, { thoughtsIntroduced: true });
      }
    })()
      .catch((error) => console.error("Could not introduce thoughts", error))
      .finally(() => {
        introducing.delete(current.root);
      });
    introducing.set(current.root, introduction);
    return introduction;
  }

  handle(CHANNELS.thoughtsPage, async (_event, before) => {
    if (before === null) {
      await introduceThoughts(journal);
    }
    return journal.thoughtsPage(
      before === null ? null : daySchema.parse(before),
      THOUGHT_DAYS_PER_PAGE
    );
  });

  handle(CHANNELS.thoughtsRead, (_event, day) =>
    journal.readThoughts(daySchema.parse(day))
  );

  handle(CHANNELS.thoughtsWrite, (_event, day, thoughts) =>
    journal.writeThoughts(daySchema.parse(day), thoughtsSchema.parse(thoughts))
  );

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
