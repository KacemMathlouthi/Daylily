import { cn } from "@daylily/ui/lib/cn";
import { Maximize, Minimize, Pin } from "lucide-react";
import { useCallback } from "react";
import type { OpenNote } from "../../lib/notes";
import { TOOL_BUTTON } from "../day/tool-button";
import { NoteMenu } from "./note-menu";

/**
 * The bar over a note (Paper 17a): when it last changed, then its pin, its ⋯
 * menu and focus mode. A note still being read, or one that can't be, has only
 * focus mode.
 */
export function NoteToolbar({
  note,
  changed,
  focused,
  onFocusChange,
  onPin,
  onShow,
  onTrash,
  className,
}: {
  /** The note, once it's ready to write in. */
  note: OpenNote | undefined;
  /** "Changed today at 14:10", or null for a note not saved yet. */
  changed: string | null;
  focused: boolean;
  onFocusChange: (focused: boolean) => void;
  onPin: () => void;
  onShow: (() => void) | undefined;
  onTrash: () => void;
  className?: string;
}) {
  const toggleFocus = useCallback(
    () => onFocusChange(!focused),
    [focused, onFocusChange]
  );
  const pinLabel = note?.pinned ? "Unpin" : "Pin to the top";
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between gap-4 bg-paper-page px-5",
        className
      )}
    >
      <p className="truncate text-caption text-ink-subtle">{changed}</p>
      <div className="flex items-center gap-1.5 [-webkit-app-region:no-drag]">
        {note ? (
          <>
            <button
              aria-label={pinLabel}
              aria-pressed={note.pinned}
              className={cn(
                TOOL_BUTTON,
                note.pinned && "text-daylily-deep hover:text-daylily-deep"
              )}
              onClick={onPin}
              title={pinLabel}
              type="button"
            >
              <Pin
                className={cn("size-3.75", note.pinned && "fill-daylily-wash")}
                strokeWidth={1.9}
              />
            </button>
            <NoteMenu
              onPin={onPin}
              onShow={onShow}
              onTrash={onTrash}
              pinned={note.pinned}
            />
          </>
        ) : null}
        <button
          aria-label={focused ? "Leave focus mode" : "Focus mode"}
          aria-pressed={focused}
          className={TOOL_BUTTON}
          onClick={toggleFocus}
          title={focused ? "Leave focus mode (Esc)" : "Focus mode"}
          type="button"
        >
          {focused ? (
            <Minimize className="size-3.75" strokeWidth={1.9} />
          ) : (
            <Maximize className="size-3.75" strokeWidth={1.9} />
          )}
        </button>
      </div>
    </header>
  );
}
