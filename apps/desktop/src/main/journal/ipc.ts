import { BrowserWindow } from "electron";
import { CHANNELS } from "../../shared/channels";
import {
  configChangesSchema,
  coverExtensionSchema,
  coverImageSchema,
  daySchema,
  pageSchema,
} from "../../shared/schemas";
import { handle } from "../ipc";
import { readConfig, writeConfig } from "./config";
import type { Journal } from "./store";
import { watchJournal } from "./watch";

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
    root: journal.root,
  }));

  handle(CHANNELS.journalList, () => journal.listDays());

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

  handle(CHANNELS.journalSetConfig, (_event, changes) =>
    writeConfig(journal.root, configChangesSchema.parse(changes))
  );

  return watcher;
}
