import { describe, expect, it } from "vitest";
import {
  isNoteName,
  type NoteFile,
  type NoteStamp,
  noteFileName,
  noteStem,
  readNoteFile,
  writeNoteFile,
} from "./note-file";

const stamp = (iso: string, timeZone = "Africa/Tunis"): NoteStamp => ({
  app: "daylily/0.9.0",
  now: new Date(iso),
  timeZone,
});

function read(text: string, name = "books-to-read.md"): NoteFile {
  const note = readNoteFile(text, name);
  if (!note.ok) {
    throw new Error(`Unreadable: ${JSON.stringify(note.error)}`);
  }
  return note.value;
}

function written(...args: Parameters<typeof writeNoteFile>) {
  const file = writeNoteFile(...args);
  if (!file.ok) {
    throw new Error(`Not written: ${JSON.stringify(file.error)}`);
  }
  return file.value;
}

describe("readNoteFile", () => {
  it("reads the title, the pin and the words", () => {
    const note = read(
      "---\ntitle: Books to read\npinned: true\ncreated: 2026-10-21T19:02:11+01:00\nupdated: 2026-10-26T14:10:00+01:00\n---\n\n- [ ] Piranesi\n"
    );
    expect(note).toEqual({
      body: "- [ ] Piranesi\n",
      created: "2026-10-21T19:02:11+01:00",
      pinned: true,
      title: "Books to read",
      updated: "2026-10-26T14:10:00+01:00",
    });
  });

  it("titles a file written elsewhere without a title by its name", () => {
    expect(read("Basil twice a day.\n", "Balcony plants.md")).toMatchObject({
      body: "Basil twice a day.\n",
      pinned: false,
      title: "Balcony plants",
    });
  });

  it("keeps an empty title empty rather than naming it after the file", () => {
    expect(read('---\ntitle: ""\n---\nWords.\n', "untitled.md").title).toBe("");
  });

  it("reads a pin it can't understand as not pinned", () => {
    expect(read("---\npinned: maybe\n---\nWords.\n").pinned).toBe(false);
  });

  it("says when the frontmatter can't be read", () => {
    expect(readNoteFile("---\ntitle: [\n---\nWords.\n", "a.md").ok).toBe(false);
  });
});

describe("writeNoteFile", () => {
  it("writes a new note with its title, times and words", () => {
    expect(
      written(
        null,
        { body: "- [ ] Piranesi", pinned: false, title: " Books to read " },
        stamp("2026-10-26T13:10:00Z")
      )
    ).toBe(
      "---\ntitle: Books to read\ncreated: 2026-10-26T14:10:00+01:00\nupdated: 2026-10-26T14:10:00+01:00\napp: daylily/0.9.0\n---\n\n- [ ] Piranesi\n"
    );
  });

  it("pins and unpins with a field that's there only while pinned", () => {
    const pinned = written(
      null,
      { body: "Words.", pinned: true, title: "Gifts" },
      stamp("2026-10-26T13:10:00Z")
    );
    expect(read(pinned).pinned).toBe(true);
    expect(pinned).toContain("title: Gifts\npinned: true\n");
    const unpinned = written(
      pinned,
      { body: "Words.", pinned: false, title: "Gifts" },
      stamp("2026-10-26T13:20:00Z")
    );
    expect(unpinned).not.toContain("pinned");
  });

  it("keeps when it was created, and fields other tools added", () => {
    const first = written(
      "---\ntitle: Lemon cake\ncreated: 2026-10-12T09:00:00+01:00\nsource: gran\n---\nOld words.\n",
      { body: "New words.", pinned: false, title: "Lemon cake" },
      stamp("2026-10-26T13:10:00Z")
    );
    expect(first).toContain("created: 2026-10-12T09:00:00+01:00");
    expect(first).toContain("source: gran");
    expect(read(first).body).toBe("New words.\n");
  });

  it("writes an empty title, so the note isn't named after its file", () => {
    const file = written(
      null,
      { body: "Words.", pinned: false, title: "" },
      stamp("2026-10-26T13:10:00Z")
    );
    expect(read(file, "untitled.md").title).toBe("");
  });

  it("titles a file that had none from another app", () => {
    const file = written(
      "Basil twice a day.\n",
      { body: "Basil twice a day.", pinned: false, title: "Balcony plants" },
      stamp("2026-10-26T13:10:00Z")
    );
    // Read under another name, so the title can only come from the file
    expect(read(file, "elsewhere.md").title).toBe("Balcony plants");
  });

  it("refuses to write over a file it can't read", () => {
    expect(
      writeNoteFile(
        "---\ntitle: [\n---\n",
        { body: "", pinned: false, title: "x" },
        stamp("2026-10-26T13:10:00Z")
      ).ok
    ).toBe(false);
  });
});

describe("noteStem", () => {
  it("makes a readable name from the title", () => {
    expect(noteStem("Books to read")).toBe("books-to-read");
    expect(noteStem("  Lisbon   in March ")).toBe("lisbon-in-march");
  });

  it("leaves out what a file name can't hold, and quotes", () => {
    expect(noteStem('Q&A: "what/why?" *now*')).toBe("q&a-whatwhy-now");
    expect(noteStem("Gran’s lemon cake")).toBe("grans-lemon-cake");
  });

  it("keeps letters of every language", () => {
    expect(noteStem("Été à Tunis")).toBe("été-à-tunis");
    expect(noteStem("ملاحظات اليوم")).toBe("ملاحظات-اليوم");
  });

  it("is untitled when nothing of the title is left", () => {
    expect(noteStem("")).toBe("untitled");
    expect(noteStem(" ?*: ")).toBe("untitled");
    expect(noteStem("...")).toBe("untitled");
  });

  it("never takes a name Windows keeps for a device", () => {
    expect(noteStem("con")).toBe("con-note");
    expect(noteStem("COM1")).toBe("com1-note");
    expect(noteStem("console")).toBe("console");
    expect(noteStem("con.txt")).toBe("con-note.txt");
  });

  it("cuts a long title short", () => {
    expect([...noteStem("a".repeat(200))]).toHaveLength(80);
    // Four bytes each: cut by bytes, never in the middle of one
    const flowers = noteStem("🌼".repeat(80));
    expect(new TextEncoder().encode(flowers).length).toBeLessThanOrEqual(180);
    expect(flowers).toBe("🌼".repeat(45));
  });
});

describe("noteFileName", () => {
  it("numbers a name that's taken", () => {
    const taken = new Set(["books.md", "books-2.md"]);
    expect(noteFileName("Books", (name) => taken.has(name))).toBe("books-3.md");
    expect(noteFileName("Gifts", (name) => taken.has(name))).toBe("gifts.md");
  });
});

describe("isNoteName", () => {
  it("takes markdown files in the notes folder", () => {
    expect(isNoteName("books-to-read.md")).toBe(true);
    expect(isNoteName("Balcony plants.MD")).toBe(true);
  });

  it("refuses paths, hidden files and other files", () => {
    expect(isNoteName("../2026-10-26.md")).toBe(false);
    expect(isNoteName("images/a.md")).toBe(false);
    expect(isNoteName(".draft.md")).toBe(false);
    expect(isNoteName("photo.jpg")).toBe(false);
    expect(isNoteName(".md")).toBe(false);
    expect(isNoteName("CON.md")).toBe(false);
    expect(isNoteName("lpt1.notes.md")).toBe(false);
  });
});
