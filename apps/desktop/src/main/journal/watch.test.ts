import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeFileAtomic } from "./atomic-write";
import { watchJournal } from "./watch";

let root: string;
let close: () => void;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "daylily-watch-"));
});

afterEach(async () => {
  close();
  await rm(root, { force: true, recursive: true });
});

/** Watchers start asynchronously on some platforms; give them a moment. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 300));

describe("watchJournal", () => {
  it("reports the days another app changed", async () => {
    await mkdir(join(root, "2026", "10", "21"), { recursive: true });
    const onChange = vi.fn();
    ({ close } = watchJournal(root, onChange));
    await settle();

    await writeFile(join(root, "2026", "10", "21", "2026-10-21.md"), "Edited");
    await vi.waitFor(() => expect(onChange).toHaveBeenCalled(), {
      timeout: 5000,
    });
    expect(onChange.mock.calls.flat(2)).toContain("2026-10-21");
  });

  it("ignores files that aren't in a day's folder", async () => {
    // Nothing made just before watching: macOS can report changes from moments earlier
    const onChange = vi.fn();
    ({ close } = watchJournal(root, onChange));
    await settle();

    await writeFile(join(root, "notes.md"), "Not a day");
    await mkdir(join(root, ".daylily"), { recursive: true });
    await writeFile(join(root, ".daylily", "config.json"), "{}");
    await settle();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("starts watching once the journal folder exists", {
    timeout: 10_000,
  }, async () => {
    const journal = join(root, "Daylily");
    const onChange = vi.fn();
    const watcher = watchJournal(journal, onChange);
    ({ close } = watcher);

    await writeFileAtomic(join(journal, "2026", "10", "21", "a.md"), "First");
    watcher.ensure();
    await settle();
    await writeFileAtomic(join(journal, "2026", "10", "21", "a.md"), "Second");
    await vi.waitFor(() => expect(onChange).toHaveBeenCalled(), {
      timeout: 5000,
    });
    expect(onChange.mock.calls.flat(2)).toContain("2026-10-21");
  });
});
