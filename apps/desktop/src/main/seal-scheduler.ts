import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Clock } from "@daylily/core/clock";
import { dayEnd, today } from "@daylily/core/day";
import { app, powerMonitor } from "electron";
import { GALLERY_COVERS } from "../shared/gallery";
import { flushAllPages } from "./flush";
import { readConfig } from "./journal/config";
import { sealEndedDays } from "./journal/seal";
import type { Journal, SealCover } from "./journal/store";

/** A moment past 4am, so the page has turned the day over before its last save is asked for. */
const AFTER_BOUNDARY_MS = 1000;
/** Looked at again at least this often, in case the clock or the zone moved. */
const LONGEST_WAIT_MS = 60 * 60 * 1000;

/** Where the gallery is: beside the app when packaged, in resources/ while developing. */
const COVERS = app.isPackaged
  ? join(process.resourcesPath, "covers")
  : join(import.meta.dirname, "../../resources/covers");

/** One of the gallery's pictures, at random, when the journal gives them at seal. */
async function randomGalleryCover(root: string): Promise<SealCover | null> {
  if (!(await readConfig(root)).galleryCovers) {
    return null;
  }
  const index = Math.floor(Math.random() * GALLERY_COVERS.length);
  const [id, , color] = GALLERY_COVERS[index] ?? GALLERY_COVERS[0];
  return {
    bytes: await readFile(join(COVERS, `${id}.jpg`)),
    color,
    extension: "jpg",
  };
}

/**
 * Seals days as they end (spec §3.3): on launch, on waking from sleep, when a
 * window gains focus, and just after each 4am while the app runs.
 */
export function sealAsDaysEnd({
  journal,
  clock,
}: {
  /** Whichever journal is open now; it can move to another folder. */
  journal: () => Journal;
  clock: Clock;
}) {
  let running = false;
  let again = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  /** Seals now, or once more after a run already under way. */
  function check() {
    if (running) {
      again = true;
      return;
    }
    running = true;
    again = false;
    const current = journal();
    sealEndedDays({
      clock,
      flush: flushAllPages,
      galleryCover: () => randomGalleryCover(current.root),
      journal: current,
    })
      .catch((error) => console.error("Could not seal the days", error))
      .finally(() => {
        running = false;
        if (again) {
          check();
        }
      });
  }

  function waitForNextBoundary() {
    clearTimeout(timer);
    const zone = clock.timeZone();
    const untilBoundary =
      dayEnd(today(clock), zone).getTime() - clock.now().getTime();
    timer = setTimeout(
      () => {
        check();
        waitForNextBoundary();
      },
      Math.min(untilBoundary + AFTER_BOUNDARY_MS, LONGEST_WAIT_MS)
    );
  }

  check();
  waitForNextBoundary();
  powerMonitor.on("resume", () => {
    check();
    waitForNextBoundary();
  });
  app.on("browser-window-focus", check);
}
