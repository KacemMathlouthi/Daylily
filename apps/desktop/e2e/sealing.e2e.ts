import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { addDays, type DayKey, dayOf } from "@daylily/core/day";
import { sealState, sealTime } from "@daylily/core/seal";
import { expect, test } from "@playwright/test";
import {
  type Computer,
  dayFile,
  freshComputer,
  openDaylily,
  readDay,
  writeUnsealedDay,
} from "./daylily";

/** Three days ago: over in every zone on Earth, whatever the hour of the test. */
const ENDED: DayKey = addDays(dayOf(new Date(), "UTC"), -3);

/** Tokyo's offset, which a day written there keeps wherever it seals. */
const TOKYO_OFFSET = /\+09:00$/;

let computer: Computer;

test.beforeEach(async () => {
  computer = await freshComputer();
});

test.afterEach(async () => {
  await computer.remove();
});

/** The day once it has sealed, waiting for the app to get to it. */
async function sealedDay(day: DayKey) {
  await expect
    .poll(async () => (await readDay(computer.journal, day))?.meta.sealed, {
      timeout: 15_000,
    })
    .toBeTruthy();
  const file = await readDay(computer.journal, day);
  if (!file) {
    throw new Error(`${day} is gone`);
  }
  return file;
}

test("seals a day left open while the app was closed, at its own 4am", async () => {
  await writeUnsealedDay(computer.journal, ENDED, {
    body: "The ferry was late, so we walked along the harbour.",
    timeZone: "Asia/Tokyo",
    title: "The harbour",
  });

  // Opened later on the other side of the world
  const opened = await openDaylily(computer, {
    timeZone: "America/Los_Angeles",
  });
  const day = await sealedDay(ENDED);

  // Stamped with the boundary where it was written, not the time it was opened
  expect(day.meta.sealed).toBe(sealTime(ENDED, "Asia/Tokyo"));
  expect(day.meta.sealed).toMatch(TOKYO_OFFSET);
  expect(await sealState(day)).toBe("sealed");
  expect(day.body).toContain("The ferry was late");

  // Written without a cover, it was given one from the gallery, copied beside the page
  expect(day.meta.cover).toBeTruthy();
  await access(
    join(dayFile(computer.journal, ENDED), "..", day.meta.cover ?? "")
  );
  await opened.app.close();
});

test("seals a day that ended while the computer slept, on waking", async () => {
  const opened = await openDaylily(computer, { timeZone: "Africa/Tunis" });
  // The day ended while asleep: on disk, open, past its 4am
  await writeUnsealedDay(computer.journal, ENDED, {
    body: "Fell asleep with the window open.",
    timeZone: "Africa/Tunis",
    title: "",
  });
  await opened.app.evaluate(({ powerMonitor }) => {
    powerMonitor.emit("resume");
  });

  const day = await sealedDay(ENDED);
  expect(day.meta.sealed).toBe(sealTime(ENDED, "Africa/Tunis"));
  expect(await sealState(day)).toBe("sealed");
  await opened.app.close();
});

test("opens a sealed day to read, never to write", async () => {
  await writeUnsealedDay(computer.journal, ENDED, {
    body: "We sat by the river until the light went.",
    timeZone: "UTC",
    title: "By the river",
  });
  const opened = await openDaylily(computer, { timeZone: "UTC" });
  await sealedDay(ENDED);

  await opened.window.evaluate((day) => {
    window.location.hash = `#/day/${day}`;
  }, ENDED);
  const page = opened.window.locator(".page-content .ProseMirror");
  await expect(page).toContainText("We sat by the river");
  await expect(page).toHaveAttribute("contenteditable", "false");
  await expect(opened.window.getByText("By the river").first()).toBeVisible();
  await opened.app.close();
});

test("says so when a sealed day was changed in another app", async () => {
  await writeUnsealedDay(computer.journal, ENDED, {
    body: "Exactly as it was.",
    timeZone: "UTC",
    title: "Kept",
  });
  const opened = await openDaylily(computer, { timeZone: "UTC" });
  const day = await sealedDay(ENDED);
  await opened.app.close();

  // Another editor changes a word; the seal no longer matches
  const path = dayFile(computer.journal, ENDED);
  await writeFile(
    path,
    (await readFile(path, "utf8")).replace("Exactly", "Almost")
  );
  expect(await sealState({ ...day, body: "Almost as it was." })).toBe("edited");

  const again = await openDaylily(computer, { timeZone: "UTC" });
  await again.window.evaluate((key) => {
    window.location.hash = `#/day/${key}`;
  }, ENDED);
  await expect(again.window.getByText("Edited outside Daylily")).toBeVisible();
  await again.app.close();
});
