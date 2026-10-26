import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeFileAtomic } from "./atomic-write";
import { type JournalChanges, watchJournal } from "./watch";

let root: string;
let watcher: ReturnType<typeof watchJournal>;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "daylily-watch-"));
});

afterEach(async () => {
  await watcher.close();
  await rm(root, { force: true, recursive: true });
});

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const reported = (onChange: ReturnType<typeof vi.fn>) =>
  onChange.mock.calls.flatMap((call) => {
    const changes = call[0] as JournalChanges;
    return [...changes.days, ...changes.notes];
  });

describe("watchJournal", () => {
  it("reports the days another app changed", async () => {
    await mkdir(join(root, "2026", "10", "21"), { recursive: true });
    const onChange = vi.fn();
    watcher = watchJournal(root, onChange);
    await watcher.ready;

    await writeFile(join(root, "2026", "10", "21", "2026-10-21.md"), "Edited");
    await vi.waitFor(() => expect(reported(onChange)).toContain("2026-10-21"));
  });

  it("reports a day saved the way Daylily saves, over the old file", async () => {
    const file = join(root, "2026", "10", "21", "2026-10-21.md");
    await writeFileAtomic(file, "First");
    const onChange = vi.fn();
    watcher = watchJournal(root, onChange);
    await watcher.ready;

    await writeFileAtomic(file, "Second");
    await vi.waitFor(() => expect(reported(onChange)).toContain("2026-10-21"));
  });

  it("starts watching the journal folder once it exists", async () => {
    const journal = join(root, "Daylily");
    const onChange = vi.fn();
    watcher = watchJournal(journal, onChange);
    await watcher.ready;

    await writeFileAtomic(join(journal, "2026", "10", "21", "a.md"), "First");
    await vi.waitFor(() => expect(reported(onChange)).toContain("2026-10-21"));
  });

  it("reports the notes changed, by their file's name", async () => {
    await mkdir(join(root, "notes"), { recursive: true });
    const onChange = vi.fn();
    watcher = watchJournal(root, onChange);
    await watcher.ready;

    await writeFileAtomic(join(root, "notes", "books.md"), "Piranesi");
    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange).toHaveBeenLastCalledWith({
      days: [],
      notes: ["books.md"],
    });
  });

  it("ignores files that aren't in a day's folder", async () => {
    const onChange = vi.fn();
    watcher = watchJournal(root, onChange);
    await watcher.ready;

    await writeFile(join(root, "notes.md"), "Not a day");
    await mkdir(join(root, "notes", "images"), { recursive: true });
    await writeFile(join(root, "notes", "images", "image-01.png"), "");
    await mkdir(join(root, ".daylily"), { recursive: true });
    await writeFile(join(root, ".daylily", "config.json"), "{}");
    await pause(500);
    expect(onChange).not.toHaveBeenCalled();
  });
});
