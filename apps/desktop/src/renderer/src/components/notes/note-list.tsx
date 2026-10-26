import { cn } from "@daylily/ui/lib/cn";
import { Plus } from "lucide-react";
import { useCallback } from "react";
import type { NoteRow } from "../../lib/notes";
import { useNow } from "../../lib/use-now";
import { TOOL_BUTTON } from "../day/tool-button";
import { changedShort } from "./when";

const ROW =
  "flex w-full flex-col gap-0.75 rounded-lg p-2.5 text-left outline-none transition-colors duration-150 hover:bg-paper-sunk focus-visible:ring-2 focus-visible:ring-daylily/40";

function GroupLabel({ children }: { children: string }) {
  return (
    <li className="px-2.5 pt-4.5 pb-1.5 font-medium text-ink-faint text-tag tracking-eyebrow first:pt-1">
      {children}
    </li>
  );
}

/** A note in the list: its title, then when it changed and how it begins. */
function NoteItem({
  row,
  chosen,
  onOpen,
  now,
}: {
  row: Extract<NoteRow, { kind: "note" }>;
  chosen: boolean;
  onOpen: (name: string) => void;
  now: Date;
}) {
  const { listed, open } = row;
  const readable = listed.state === "ok";
  // The title being written, once the note is read; until then, as listed
  const listedTitle = readable ? listed.title : "";
  const title = (open?.load === "ready" ? open.title : listedTitle).trim();
  const { name } = listed;
  const choose = useCallback(() => onOpen(name), [name, onOpen]);
  return (
    <li>
      <button
        aria-current={chosen ? "page" : undefined}
        className={cn(ROW, chosen && "bg-paper-tint hover:bg-paper-tint")}
        onClick={choose}
        type="button"
      >
        <span
          className={cn(
            "truncate font-medium text-ui leading-4.25",
            title ? "text-ink" : "text-ink-muted"
          )}
        >
          {title || (readable ? "Untitled" : listed.name)}
        </span>
        <span className="flex min-w-0 gap-1.5 text-xs leading-4">
          <span className="shrink-0 text-ink-muted">
            {changedShort(listed.updated, now)}
          </span>
          <span className="truncate text-ink-subtle">
            {readable ? listed.excerpt : "Can’t be read"}
          </span>
        </span>
      </button>
    </li>
  );
}

/**
 * The notes beside the one open (Paper 17a, 17b): the new note waiting for its
 * first word, then pinned notes, then the rest, most recently changed first.
 */
export function NoteList({
  rows,
  chosen,
  onOpen,
  onNew,
  header,
}: {
  rows: NoteRow[];
  /** The open note's id. */
  chosen: string | undefined;
  onOpen: (name: string) => void;
  onNew: () => void;
  /** Classes for the header, as focus mode and macOS's drag area need. */
  header: string;
}) {
  const now = useNow();
  const notes = rows.filter((row) => row.kind === "note");
  const pinned = notes.filter(
    (row) => row.listed.state === "ok" && row.listed.pinned
  );
  const recent = notes.filter((row) => !pinned.includes(row));
  const waiting = rows.find((row) => row.kind === "new");
  const item = (row: Extract<NoteRow, { kind: "note" }>) => (
    <NoteItem
      chosen={row.open !== undefined && row.open.id === chosen}
      key={row.listed.name}
      now={now}
      onOpen={onOpen}
      row={row}
    />
  );

  return (
    <nav
      aria-label="Notes"
      className="flex w-70 shrink-0 flex-col border-line border-r bg-paper-page"
    >
      <header
        className={cn(
          "sticky top-0 z-10 flex h-12 shrink-0 items-center justify-between bg-paper-page pr-3 pl-5",
          header
        )}
      >
        <h1 className="font-medium text-caption text-ink">Notes</h1>
        <button
          aria-label="New note"
          className={cn(TOOL_BUTTON, "[-webkit-app-region:no-drag]")}
          onClick={onNew}
          title="New note"
          type="button"
        >
          <Plus className="size-3.75" strokeWidth={1.9} />
        </button>
      </header>
      <ul className="flex flex-col gap-0.5 px-2.5 pt-1.5 pb-6">
        {waiting ? (
          <li>
            <button
              aria-current={waiting.open.id === chosen ? "page" : undefined}
              className={cn(
                ROW,
                waiting.open.id === chosen &&
                  "bg-paper-tint hover:bg-paper-tint"
              )}
              onClick={onNew}
              type="button"
            >
              <span className="truncate font-medium text-ink-muted text-ui leading-4.25">
                {waiting.open.title.trim() || "New note"}
              </span>
              <span className="font-medium text-daylily-deep text-xs leading-4">
                Now
              </span>
            </button>
          </li>
        ) : null}
        {notes.length === 0 ? (
          <li className="px-2.5 pt-3.5 font-writing text-ink-subtle text-sm italic leading-5.25">
            The pages you keep: undated, never sealed, changed whenever you
            like.
          </li>
        ) : null}
        {pinned.length > 0 ? (
          <>
            <GroupLabel>Pinned</GroupLabel>
            {pinned.map(item)}
            {recent.length > 0 ? <GroupLabel>Recent</GroupLabel> : null}
          </>
        ) : null}
        {recent.map(item)}
      </ul>
    </nav>
  );
}
