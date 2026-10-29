import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type DayKey, dayPath } from "@daylily/core/day";
import {
  type DayFile,
  readDayFile,
  writeDayFile,
} from "@daylily/core/day-file";
import {
  type ElectronApplication,
  _electron as electron,
  expect,
  type Page,
  test,
} from "@playwright/test";

/** A computer of its own for one test: the app's data folder and a journal, both empty. */
export interface Computer {
  journal: string;
  remove: () => Promise<void>;
  userData: string;
}

/**
 * A computer where Daylily has been set up already, onboarding done, its journal
 * in a folder of the test's own. Nothing touches the real journal or settings.
 */
export async function freshComputer(): Promise<Computer> {
  const root = await mkdtemp(join(tmpdir(), "daylily-e2e-"));
  const journal = join(root, "journal");
  const userData = join(root, "user-data");
  await mkdir(journal, { recursive: true });
  await mkdir(userData, { recursive: true });
  await writeFile(
    join(userData, "settings.json"),
    JSON.stringify({ journalPath: journal, onboarded: true })
  );
  return {
    journal,
    // Windows can hold a file for a moment after the app is gone
    remove: () =>
      rm(root, {
        force: true,
        maxRetries: 10,
        recursive: true,
        retryDelay: 200,
      }),
    userData,
  };
}

export interface Opened {
  app: ElectronApplication;
  /** The main window, once the app has loaded behind the splash. */
  window: Page;
}

/** Opens Daylily as built in `out/`, on this computer, in a time zone if given. */
export async function openDaylily(
  computer: Computer,
  { timeZone }: { timeZone?: string } = {}
): Promise<Opened> {
  const app = await electron.launch({
    args: [
      // Linux runners can't give Chromium its sandbox; the page's own stays on
      ...(process.platform === "linux" ? ["--no-sandbox"] : []),
      `--user-data-dir=${computer.userData}`,
      // The desktop app's folder, beside e2e/; its package.json points at out/
      join(test.info().project.testDir, ".."),
    ],
    env: { ...process.env, ...(timeZone ? { TZ: timeZone } : {}) },
  });
  const window = await mainWindow(app);
  // The app opens on Home as the splash fades: anything done before would be undone
  const splash = app.windows().find((page) => page.url().includes("splash"));
  if (splash && !splash.isClosed()) {
    await splash.waitForEvent("close");
  }
  await expect(
    window.getByRole("link", { name: "Today" }).first()
  ).toBeVisible();
  return { app, window };
}

/** The app's window rather than the splash, which opens first. */
async function mainWindow(app: ElectronApplication) {
  const isMain = (page: Page) => page.url().includes("index.html");
  const open = app.windows().find(isMain);
  if (open) {
    return open;
  }
  for (;;) {
    // biome-ignore lint/performance/noAwaitInLoops: windows open one at a time
    const page = await app.waitForEvent("window");
    if (isMain(page)) {
      return page;
    }
  }
}

/**
 * Ends Daylily at once, with no chance to save, as a crash or a pulled plug
 * would. On Windows the app's other processes outlive the main one and hold its
 * files, so the whole tree goes, as Task Manager's "End task" does.
 */
export async function forceQuit({ app }: Opened) {
  const main = app.process();
  const exited = new Promise((resolve) => main.once("exit", resolve));
  if (process.platform === "win32" && main.pid !== undefined) {
    execFileSync("taskkill", ["/pid", String(main.pid), "/t", "/f"]);
  } else {
    main.kill("SIGKILL");
  }
  await exited;
}

/** Today's page, its editor ready to write in. */
export async function openToday({ window }: Opened) {
  await window.getByRole("link", { name: "Today" }).first().click();
  const page = window.locator(".page-content .ProseMirror").last();
  await expect(page).toBeVisible();
  return page;
}

/** Where a day's page is kept in a journal. */
export function dayFile(journal: string, day: DayKey) {
  return join(journal, ...dayPath(day));
}

/** A day's page as it is on disk, read as Daylily reads it, or null when there's none. */
export async function readDay(
  journal: string,
  day: DayKey
): Promise<DayFile | null> {
  let text: string;
  try {
    text = await readFile(dayFile(journal, day), "utf8");
  } catch {
    return null;
  }
  const file = readDayFile(text);
  if (!file.ok) {
    throw new Error(`${day} can't be read: ${file.error.kind}`);
  }
  return file.value;
}

/** A page written on a day, in a zone, left unsealed, as if the app was closed when it ended. */
export async function writeUnsealedDay(
  journal: string,
  day: DayKey,
  { body, timeZone, title }: { body: string; timeZone: string; title: string }
) {
  const written = writeDayFile(
    null,
    { body, cover: null, title },
    { app: "daylily/e2e", now: new Date(`${day}T12:00:00Z`), timeZone }
  );
  if (!written.ok) {
    throw new Error(`Could not write ${day}: ${written.error.kind}`);
  }
  const path = dayFile(journal, day);
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, written.value);
}
