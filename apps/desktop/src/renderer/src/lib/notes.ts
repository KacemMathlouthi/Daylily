import { pageExcerpt } from "@daylily/core/excerpt";
import type { NoteContent } from "@daylily/core/note-file";
import { type QueryClient, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ListedNote, StoredNote } from "../../../shared/journal";
import {
  flushSaves,
  hasUnsavedChanges,
  markSaved,
  scheduleSave,
} from "./autosave";
import { createStore } from "./store";

/**
 * A note as the screen holds it while it's open. `name` is its file, null for
 * a new note until its first word; `settledTitle` is the title its file's name
 * was last made from, so a changed title renames it once it's left.
 */
export interface OpenNote extends NoteContent {
  id: string;
  /** Not read yet, read, or a file that can't be read and is never written over. */
  load: "loading" | "ready" | "unreadable";
  name: string | null;
  /** Goes up when the note is read again after another app changed its file. */
  revision: number;
  settledTitle: string;
}

/** A row in the list: a note's file, or the new note waiting for its first word. */
export type NoteRow =
  | { kind: "note"; listed: ListedNote; open: OpenNote | undefined }
  | { kind: "new"; open: OpenNote };

const NOTES_KEY = ["journal", "notes"] as const;

const held = createStore<ReadonlyMap<string, OpenNote>>(new Map());
/** The note on screen, by id. */
const chosen = createStore<string | null>(null);
/**
 * Files Daylily renamed or moved to the Trash, left out of the list until it's
 * read again, so a note never shows twice for a moment.
 */
const departed = createStore<ReadonlySet<string>>(new Set());

function depart(name: string, gone: boolean) {
  departed.set((current) => {
    const next = new Set(current);
    if (gone) {
      next.add(name);
    } else {
      next.delete(name);
    }
    return next;
  });
}
/** The note whose title is being written: its file keeps its name until it's left. */
let editingTitleOf: string | null = null;

let lastId = 0;
const newId = () => {
  lastId += 1;
  return `note-${lastId}`;
};

const saveKey = (id: string) => `note:${id}`;

function setNote(id: string, change: (note: OpenNote) => OpenNote) {
  held.set((current) => {
    const note = current.get(id);
    return note ? new Map(current).set(id, change(note)) : current;
  });
}

function hold(note: OpenNote) {
  held.set((current) => new Map(current).set(note.id, note));
}

function release(id: string) {
  held.set((current) => {
    const next = new Map(current);
    next.delete(id);
    return next;
  });
}

const isBlank = (note: NoteContent) =>
  note.title.trim() === "" && note.body.trim() === "";

function fromFile(id: string, stored: StoredNote, revision: number): OpenNote {
  return {
    body: stored.body,
    id,
    load: "ready",
    name: stored.name,
    pinned: stored.pinned,
    revision,
    settledTitle: stored.title,
    title: stored.title,
  };
}

/** Reads a note's file into the screen; false when it's gone. */
async function read(id: string, name: string) {
  try {
    const found = await window.daylily.notes.read(name);
    if (!found.ok) {
      setNote(id, (note) => ({ ...note, load: "unreadable" }));
    } else if (found.value) {
      const stored = found.value;
      setNote(id, (note) => fromFile(id, stored, note.revision + 1));
      markSaved(saveKey(id));
    } else {
      // Gone before it could be read
      forget(id);
      return false;
    }
  } catch (error) {
    console.error("Could not read the note", error);
    setNote(id, (note) => ({ ...note, load: "unreadable" }));
  }
  return true;
}

/**
 * Puts a note's file on screen, reading it the first time. Resolves false when
 * there's no such note, as for a search result whose file has gone since.
 */
export function openNote(name: string): Promise<boolean> {
  const open = [...held.get().values()].find((note) => note.name === name);
  if (open) {
    choose(open.id);
    return Promise.resolve(true);
  }
  const id = newId();
  hold({
    body: "",
    id,
    load: "loading",
    name,
    pinned: false,
    revision: 0,
    settledTitle: "",
    title: "",
  });
  choose(id);
  return read(id, name);
}

/** A new note on screen, waiting for its first word: the one already waiting, if there is one. */
export function startNote() {
  const waiting = [...held.get().values()].find((note) => note.name === null);
  if (waiting) {
    choose(waiting.id);
    return;
  }
  const id = newId();
  hold({
    body: "",
    id,
    load: "ready",
    name: null,
    pinned: false,
    revision: 0,
    settledTitle: "",
    title: "",
  });
  choose(id);
}

/** Changes which note is on screen; a new note left with nothing in it goes. */
function choose(id: string | null) {
  const left = chosen.get();
  const leaving = left === null ? undefined : held.get().get(left);
  if (
    leaving &&
    leaving.id !== id &&
    leaving.name === null &&
    isBlank(leaving)
  ) {
    release(leaving.id);
  }
  chosen.set(id);
}

/** Lets a note go from the screen, as when its file went. */
function forget(id: string) {
  release(id);
  if (chosen.get() === id) {
    chosen.set(null);
  }
}

function save(id: string) {
  scheduleSave(saveKey(id), () => {
    const note = held.get().get(id);
    if (note?.load !== "ready") {
      return null;
    }
    const { body, name, pinned, title } = note;
    const rename =
      name !== null &&
      editingTitleOf !== id &&
      title.trim() !== note.settledTitle.trim();
    return window.daylily.notes
      .write(name, { body, pinned, title }, rename)
      .then((result) => {
        if (result.ok && result.value) {
          const saved = result.value;
          depart(saved.name, false);
          if (name !== null && name !== saved.name) {
            depart(name, true);
          }
          setNote(id, (current) => ({
            ...current,
            name: saved.name,
            settledTitle:
              rename || name === null ? title : current.settledTitle,
          }));
        }
        return result;
      });
  });
}

/** A note changed: its words, title or pin. Saved shortly after. */
export function changeNote(id: string, change: Partial<NoteContent>) {
  setNote(id, (note) => ({ ...note, ...change }));
  save(id);
}

/** The title is being written: the file keeps its name until it's left. */
export function editTitle(id: string) {
  editingTitleOf = id;
}

/** The title was left: the note's file takes the name it asks for. */
export function leaveTitle(id: string) {
  if (editingTitleOf === id) {
    editingTitleOf = null;
  }
  const note = held.get().get(id);
  if (note?.name && note.title.trim() !== note.settledTitle.trim()) {
    save(id);
  }
}

/**
 * Moves the note to the system's Trash, saving it first so the Trash holds
 * every word. A new note that was never saved simply goes.
 */
export async function trashNote(id: string) {
  await flushSaves();
  const note = held.get().get(id);
  if (!note) {
    return { ok: true } as const;
  }
  // Its last words didn't reach the file: the Trash would keep an older note
  if (hasUnsavedChanges(saveKey(id))) {
    return { error: { code: "UNSAVED", kind: "io" }, ok: false } as const;
  }
  if (note.name !== null) {
    const trashed = await window.daylily.notes.trash(note.name);
    if (!trashed.ok) {
      return trashed;
    }
    depart(note.name, true);
  }
  forget(id);
  return { ok: true } as const;
}

/**
 * Follows notes changed on disk, by Daylily or another app: the list is read
 * again, and an open note takes its file's words, unless it has words of its
 * own still to save, which then win as they're written.
 */
export function followNotes(client: QueryClient) {
  return window.daylily.notes.onChange((names) => {
    client.invalidateQueries({ queryKey: NOTES_KEY });
    for (const note of held.get().values()) {
      if (
        note.name !== null &&
        names.includes(note.name) &&
        !hasUnsavedChanges(saveKey(note.id))
      ) {
        reread(note);
      }
    }
  });
}

async function reread(note: OpenNote) {
  const { id, name } = note;
  if (name === null) {
    return;
  }
  let found: Awaited<ReturnType<typeof window.daylily.notes.read>>;
  try {
    found = await window.daylily.notes.read(name);
  } catch (error) {
    console.error("Could not read a changed note", error);
    found = { error: { code: "UNKNOWN", kind: "io" }, ok: false };
  }
  const current = held.get().get(id);
  // Changed on screen, saved, or renamed while it was being read: what was
  // read may be older than what's held
  if (
    current !== note ||
    current.name !== name ||
    hasUnsavedChanges(saveKey(id))
  ) {
    return;
  }
  if (!found.ok) {
    setNote(id, (each) => ({ ...each, load: "unreadable" }));
    return;
  }
  const stored = found.value;
  if (!stored) {
    forget(id);
    return;
  }
  const same =
    current.load === "ready" &&
    current.title.trim() === stored.title.trim() &&
    current.pinned === stored.pinned &&
    current.body.trim() === stored.body.trim();
  if (!same) {
    setNote(id, (each) => fromFile(id, stored, each.revision + 1));
    markSaved(saveKey(id));
  }
}

/** Starts over, as when the journal moves to another folder; anything unsaved was saved first. */
export function forgetNotes() {
  held.set(new Map());
  chosen.set(null);
  departed.set(new Set());
  editingTitleOf = null;
}

/** Every note in the folder, as listed; undefined while it's first read. */
export function useListedNotes() {
  return useQuery({
    queryFn: () => window.daylily.notes.list(),
    queryKey: NOTES_KEY,
    staleTime: Number.POSITIVE_INFINITY,
  }).data;
}

/** Pinned first, then the rest, each most recently changed first. */
function byPinThenChange(a: ListedNote, b: ListedNote) {
  const pinnedA = a.state === "ok" && a.pinned;
  const pinnedB = b.state === "ok" && b.pinned;
  if (pinnedA !== pinnedB) {
    return pinnedA ? -1 : 1;
  }
  // As instants: times come with the offset they were written in, or in UTC
  return Date.parse(b.updated) - Date.parse(a.updated);
}

/** A note saved just now, as the list will read it once its file is listed. */
function listedNow(note: OpenNote & { name: string }): ListedNote {
  return {
    excerpt: pageExcerpt(note.body),
    name: note.name,
    pinned: note.pinned,
    state: "ok",
    title: note.title,
    updated: new Date().toISOString(),
  };
}

function rowsOf(
  listed: ListedNote[] | undefined,
  open: ReadonlyMap<string, OpenNote>,
  gone: ReadonlySet<string>
): NoteRow[] {
  const files = new Map(
    (listed ?? [])
      .filter((note) => !gone.has(note.name))
      .map((note) => [note.name, note] as const)
  );
  const byName = new Map<string, OpenNote>();
  const waiting: NoteRow[] = [];
  for (const note of open.values()) {
    if (note.name === null) {
      waiting.push({ kind: "new", open: note });
    } else {
      byName.set(note.name, note);
      if (!files.has(note.name) && note.load === "ready") {
        files.set(note.name, listedNow({ ...note, name: note.name }));
      }
    }
  }
  const rows = [...files.values()].sort(byPinThenChange).map(
    (note): NoteRow => ({
      kind: "note",
      listed: note,
      open: byName.get(note.name),
    })
  );
  return [...waiting, ...rows];
}

/** The list as it is now, as the screen shows it. */
export function noteRows(listed: ListedNote[] | undefined) {
  return rowsOf(listed, held.get(), departed.get());
}

/**
 * The list beside the open note (Paper 17a): the new note waiting for its
 * first word on top, then pinned notes, then the rest, each most recently
 * changed first. A note open on screen shows its title as it's being written,
 * and one saved a moment ago is there before the folder is listed again.
 */
export function useNoteRows(listed: ListedNote[] | undefined): NoteRow[] {
  const open = held.use();
  const gone = departed.use();
  return useMemo(() => rowsOf(listed, open, gone), [gone, listed, open]);
}

/** The note on screen, by id, as it is now. */
export function chosenNote() {
  const id = chosen.get();
  return id === null ? undefined : held.get().get(id);
}

/** The note on screen; undefined when none is chosen yet. */
export function useChosenNote(): OpenNote | undefined {
  const id = chosen.use();
  const open = held.use();
  return id === null ? undefined : open.get(id);
}

export { saveKey as noteSaveKey };
