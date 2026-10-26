import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ListedNote, StoredNote } from "../../../shared/journal";
import { flushSaves, forgetSaves } from "./autosave";
import {
  changeNote,
  chosenNote,
  editTitle,
  forgetNotes,
  leaveTitle,
  noteRows,
  openNote,
  startNote,
  trashNote,
} from "./notes";

const write = vi.fn();
const read = vi.fn();
const trash = vi.fn();

const stored = (name: string, title: string, body = "Words."): StoredNote => ({
  body,
  name,
  pinned: false,
  title,
  updated: "2026-10-26T14:10:00+01:00",
});

const listed = (name: string, updated: string, pinned = false): ListedNote => ({
  excerpt: "",
  name,
  pinned,
  state: "ok",
  title: name,
  updated,
});

/** The note on screen, which a test expects there. */
function chosen() {
  const note = chosenNote();
  if (!note) {
    throw new Error("No note on screen");
  }
  return note;
}

beforeEach(() => {
  vi.useFakeTimers();
  write.mockReset();
  read.mockReset();
  trash.mockReset();
  // Saved under a name from its title, as the main process does
  write.mockImplementation((name: string | null, note: { title: string }) =>
    Promise.resolve({
      ok: true,
      value: stored(name ?? "untitled.md", note.title),
    })
  );
  trash.mockResolvedValue({ ok: true });
  vi.stubGlobal("window", { daylily: { notes: { read, trash, write } } });
});

afterEach(() => {
  forgetSaves();
  forgetNotes();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("a new note", () => {
  it("leaves no trace until its first word", async () => {
    startNote();
    await flushSaves();
    expect(write).not.toHaveBeenCalled();

    changeNote(chosen().id, { body: "Piranesi" });
    await flushSaves();
    expect(write).toHaveBeenCalledWith(
      null,
      { body: "Piranesi", pinned: false, title: "" },
      false
    );
    expect(chosen().name).toBe("untitled.md");
  });

  it("goes when it's left with nothing in it", () => {
    startNote();
    const { id } = chosen();
    read.mockResolvedValue({ ok: true, value: stored("gifts.md", "Gifts") });
    openNote("gifts.md");
    expect(noteRows([]).some((row) => row.open?.id === id)).toBe(false);
  });

  it("is the one already waiting when asked for again", () => {
    startNote();
    const { id } = chosen();
    startNote();
    expect(chosen().id).toBe(id);
  });
});

describe("a note's name", () => {
  async function saved(name: string, title: string) {
    read.mockResolvedValue({ ok: true, value: stored(name, title) });
    openNote(name);
    await vi.waitFor(() => expect(chosen().load).toBe("ready"));
    return chosen().id;
  }

  it("stays while its title is being written, and follows it once left", async () => {
    const id = await saved("bo.md", "Bo");
    editTitle(id);
    changeNote(id, { title: "Books to read" });
    await flushSaves();
    expect(write).toHaveBeenLastCalledWith(
      "bo.md",
      expect.objectContaining({ title: "Books to read" }),
      false
    );

    leaveTitle(id);
    await flushSaves();
    expect(write).toHaveBeenLastCalledWith(
      "bo.md",
      expect.objectContaining({ title: "Books to read" }),
      true
    );
  });

  it("isn't asked to change when only the words do", async () => {
    const id = await saved("Balcony plants.md", "Balcony plants");
    changeNote(id, { body: "Mint in the shade." });
    await flushSaves();
    expect(write).toHaveBeenLastCalledWith(
      "Balcony plants.md",
      expect.anything(),
      false
    );
  });

  it("never writes a note that was only opened", async () => {
    await saved("gifts.md", "Gifts");
    await flushSaves();
    expect(write).not.toHaveBeenCalled();
  });
});

describe("the list", () => {
  it("puts pinned notes first, then the rest, most recently changed first", () => {
    const rows = noteRows([
      listed("old.md", "2026-10-20T09:00:00+01:00"),
      // An hour later than "old", though it reads as earlier
      listed("utc.md", "2026-10-20T09:30:00Z"),
      listed("pinned.md", "2026-01-01T09:00:00+01:00", true),
    ]);
    expect(
      rows.map((row) => (row.kind === "note" ? row.listed.name : "new"))
    ).toEqual(["pinned.md", "utc.md", "old.md"]);
  });

  it("puts the new note waiting for its first word on top", () => {
    startNote();
    const [first] = noteRows([listed("a.md", "2026-10-20T09:00:00Z")]);
    expect(first?.kind).toBe("new");
  });
});

describe("moving a note to the Trash", () => {
  it("saves its last words first, then lets it go", async () => {
    read.mockResolvedValue({ ok: true, value: stored("trip.md", "Trip") });
    openNote("trip.md");
    await vi.waitFor(() => expect(chosen().load).toBe("ready"));
    const { id } = chosen();
    changeNote(id, { body: "Last words." });

    expect(await trashNote(id)).toEqual({ ok: true });
    expect(write).toHaveBeenCalledWith(
      "trip.md",
      expect.objectContaining({ body: "Last words." }),
      false
    );
    expect(trash).toHaveBeenCalledWith("trip.md");
    expect(chosenNote()).toBeUndefined();
    expect(noteRows([listed("trip.md", "2026-10-20T09:00:00Z")]).length).toBe(
      0
    );
  });

  it("keeps it when the Trash refuses", async () => {
    trash.mockResolvedValue({
      error: { code: "ENOTRASH", kind: "io" },
      ok: false,
    });
    read.mockResolvedValue({ ok: true, value: stored("trip.md", "Trip") });
    openNote("trip.md");
    await vi.waitFor(() => expect(chosen().load).toBe("ready"));
    expect((await trashNote(chosen().id)).ok).toBe(false);
    expect(chosenNote()?.name).toBe("trip.md");
  });
});
