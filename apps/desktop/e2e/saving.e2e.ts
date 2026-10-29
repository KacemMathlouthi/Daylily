import { dayOf } from "@daylily/core/day";
import { expect, test } from "@playwright/test";
import {
  type Computer,
  forceQuit,
  freshComputer,
  openDaylily,
  openToday,
  readDay,
} from "./daylily";

/** A zone of its own, so "today" is the same day for the test and the app. */
const ZONE = "UTC";

let computer: Computer;

test.beforeEach(async () => {
  computer = await freshComputer();
});

test.afterEach(async () => {
  await computer.remove();
});

test("keeps what was typed half a second before a force-quit", async () => {
  const opened = await openDaylily(computer, { timeZone: ZONE });
  const page = await openToday(opened);
  await page.click();
  await opened.window.keyboard.type("I took the long way home today.");
  // Saved half a second after typing stops (spec §3.5); a little more for the disk
  await opened.window.waitForTimeout(1000);
  await opened.window.keyboard.type(" And then");
  // Mid-sentence, with no chance to save: the words before the pause must be there
  await forceQuit(opened);

  const today = dayOf(new Date(), ZONE);
  const saved = await readDay(computer.journal, today);
  expect(saved?.body).toContain("I took the long way home today.");

  const again = await openDaylily(computer, { timeZone: ZONE });
  await expect(await openToday(again)).toContainText(
    "I took the long way home today."
  );
  await again.app.close();
});

test("saves the page when the app quits right after typing", async () => {
  const opened = await openDaylily(computer, { timeZone: ZONE });
  const page = await openToday(opened);
  await page.click();
  await opened.window.keyboard.type("The daylilies were still open.");
  // No pause: quitting saves what's on the page first
  await opened.app.close();

  const today = dayOf(new Date(), ZONE);
  const saved = await readDay(computer.journal, today);
  expect(saved?.body).toContain("The daylilies were still open.");
  expect(saved?.meta.words).toBe(5);
});

test("leaves no trace when opened and closed without writing", async () => {
  const opened = await openDaylily(computer, { timeZone: ZONE });
  await openToday(opened);
  await opened.app.close();

  expect(await readDay(computer.journal, dayOf(new Date(), ZONE))).toBeNull();
});
