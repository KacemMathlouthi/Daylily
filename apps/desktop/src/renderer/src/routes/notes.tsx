import { countMarkdownWords } from "@daylily/core/words";
import { cn } from "@daylily/ui/lib/cn";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { StatusBar, wordCount } from "../components/day/status-bar";
import { NoteList } from "../components/notes/note-list";
import { NoteToolbar } from "../components/notes/note-toolbar";
import { NoteView, UnreadableNote } from "../components/notes/note-view";
import { changedLong } from "../components/notes/when";
import { useSaveState } from "../lib/autosave";
import { useFocusChrome } from "../lib/focus-mode";
import { useJournalInfo } from "../lib/journal-info";
import {
  changeNote,
  type NoteRow,
  noteSaveKey,
  type OpenNote,
  openNote,
  startNote,
  trashNote,
  useChosenNote,
  useListedNotes,
  useNoteRows,
} from "../lib/notes";
import { validateFoundNote } from "../lib/search";
import { useNotice } from "../lib/use-notice";
import { useNow } from "../lib/use-now";

export const Route = createFileRoute("/notes")({
  component: NotesScreen,
  validateSearch: validateFoundNote,
});

/**
 * The status bar's line: a passing notice, why the note is left as it is, a
 * failed save, where a new note will go, or where this one is saved.
 */
function useSaveLabel(note: OpenNote | undefined, notice: string | null) {
  const save = useSaveState(noteSaveKey(note?.id ?? ""));
  const info = useJournalInfo();
  if (notice) {
    return { dot: "bg-ink-ghost", label: notice };
  }
  if (note?.load === "unreadable") {
    return {
      dot: "bg-ink-ghost",
      label: "This note can’t be read, so Daylily won’t write over it.",
    };
  }
  if (save?.kind === "failed") {
    return { dot: "bg-daylily", label: save.message };
  }
  const folder = info ? [info.displayRoot, "notes"].join(info.separator) : "";
  if (!note?.name) {
    return {
      dot: "bg-ink-ghost",
      label: `Each note is saved to ${folder || "your journal"} from its first word.`,
    };
  }
  return {
    dot: save?.kind === "unsaved" ? "bg-saffron" : "bg-moss",
    label: `Saved to ${[folder, note.name].join(info?.separator ?? "/")}`,
  };
}

/** The note after this one in the list, or before it at the end: where to go once it's gone. */
function nextNote(rows: NoteRow[], id: string) {
  const files = rows.filter((row) => row.kind === "note");
  const index = files.findIndex((row) => row.open?.id === id);
  const next =
    index === -1 ? undefined : (files[index + 1] ?? files[index - 1]);
  return next?.listed.name;
}

/** Paper's "17 Notes": the pages you keep, listed beside the one open. */
function NotesScreen() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const listed = useListedNotes();
  const rows = useNoteRows(listed);
  const note = useChosenNote();
  const now = useNow();
  const { chrome, focused, setFocused } = useFocusChrome();
  const [notice, setNotice] = useNotice();
  const { dot, label } = useSaveLabel(note, notice);
  const isMac = window.daylily.platform === "darwin";
  const drag = isMac ? "[-webkit-app-region:drag]" : "";

  const forgetFound = useCallback(
    () => navigate({ replace: true, search: {}, to: "/notes" }),
    [navigate]
  );

  // Opened from search: that note, at what was found
  useEffect(() => {
    if (search.note) {
      openNote(search.note);
    }
  }, [search.note]);

  // Nothing open: the first note in the list, or a new one in an empty folder
  useEffect(() => {
    if (note || search.note || listed === undefined) {
      return;
    }
    const first = rows.find((row) => row.kind === "note");
    if (first?.kind === "note") {
      openNote(first.listed.name);
    } else {
      startNote();
    }
  }, [listed, note, rows, search.note]);

  const trash = useCallback(async () => {
    if (!note) {
      return;
    }
    const next = nextNote(rows, note.id);
    const title = note.title.trim() || "Untitled";
    const trashed = await trashNote(note.id);
    if (!trashed.ok) {
      setNotice(
        "Couldn’t move it to the Trash. It’s still in your notes folder."
      );
      return;
    }
    if (next) {
      openNote(next);
    } else {
      startNote();
    }
    if (note.name) {
      setNotice(`“${title}” is in the Trash.`);
    }
  }, [note, rows, setNotice]);

  const togglePin = useCallback(() => {
    if (note) {
      changeNote(note.id, { pinned: !note.pinned });
    }
  }, [note]);

  const name = note?.name;
  const show = useCallback(() => {
    if (name) {
      window.daylily.notes.show(name);
    }
  }, [name]);

  const updated = rows.find(
    (row) => row.kind === "note" && row.listed.name === note?.name
  );
  const ready = note?.load === "ready" ? note : undefined;

  return (
    <div className="flex h-full min-h-0 grow">
      {focused ? null : (
        <NoteList
          chosen={note?.id}
          header={drag}
          onNew={startNote}
          onOpen={openNote}
          rows={rows}
        />
      )}
      <div className="flex min-w-0 grow flex-col overflow-y-auto">
        <NoteToolbar
          changed={
            updated?.kind === "note"
              ? changedLong(updated.listed.updated, now)
              : null
          }
          className={cn(drag, chrome)}
          focused={focused}
          note={ready}
          onFocusChange={setFocused}
          onPin={togglePin}
          onShow={ready?.name ? show : undefined}
          onTrash={trash}
        />
        <div className="flex grow justify-center px-8 pt-6.5 pb-16">
          {note?.load === "unreadable" ? (
            <UnreadableNote onShow={show} />
          ) : null}
          {ready ? (
            <NoteView
              find={search.note === ready.name ? search.find : undefined}
              // Opened afresh for another note, or this one changed elsewhere
              key={`${ready.id}:${ready.revision}`}
              note={ready}
              onFound={forgetFound}
              onProblem={setNotice}
            />
          ) : null}
        </div>
        <StatusBar className={chrome} dot={dot} label={label}>
          {ready ? (
            <span>{wordCount(countMarkdownWords(ready.body))}</span>
          ) : null}
        </StatusBar>
      </div>
    </div>
  );
}
