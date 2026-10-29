import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { dayOf, dayPath } from "@daylily/core/day";
import { expect, test } from "@playwright/test";
import { type Computer, freshComputer, openDaylily } from "./daylily";

const ZONE = "UTC";

let computer: Computer;

test.beforeEach(async () => {
  computer = await freshComputer();
});

test.afterEach(async () => {
  await computer.remove();
});

/** Everything in the journal's notes, as written to disk. */
async function notesOnDisk() {
  const folder = join(computer.journal, "notes");
  const names = await readdir(folder).catch(() => []);
  const notes = names.filter((name) => name.endsWith(".md"));
  return Promise.all(notes.map((name) => readFile(join(folder, name), "utf8")));
}

test("keeps a thought typed before a force-quit", async () => {
  const opened = await openDaylily(computer, { timeZone: ZONE });
  await opened.window.getByRole("link", { name: "Thoughts" }).click();
  // The thought waiting at the top, for now
  const thought = opened.window.locator("article .ProseMirror").first();
  await thought.click();
  await opened.window.keyboard.type("Someone on the bus was reading Rilke.");
  await opened.window.waitForTimeout(1000);
  opened.app.process().kill("SIGKILL");

  // Beside the day's page, in the day's folder
  const [year, month, date] = dayPath(dayOf(new Date(), ZONE));
  const thoughts = await readFile(
    join(computer.journal, year, month, date, "thoughts.md"),
    "utf8"
  );
  expect(thoughts).toContain("Someone on the bus was reading Rilke.");
});

test("keeps a note typed before a force-quit", async () => {
  const opened = await openDaylily(computer, { timeZone: ZONE });
  await opened.window.getByRole("link", { name: "Notes" }).click();
  // An empty folder opens on a new note
  await opened.window.getByLabel("Note title").fill("Books to read");
  await opened.window.locator(".page-content .ProseMirror").click();
  await opened.window.keyboard.type("The Remains of the Day");
  await opened.window.waitForTimeout(1000);
  opened.app.process().kill("SIGKILL");

  const notes = await notesOnDisk();
  expect(notes.join("\n")).toContain("The Remains of the Day");

  const again = await openDaylily(computer, { timeZone: ZONE });
  await again.window.getByRole("link", { name: "Notes" }).click();
  await expect(
    again.window.locator(".page-content .ProseMirror")
  ).toContainText("The Remains of the Day");
  await again.app.close();
});
