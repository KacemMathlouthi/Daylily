import { cn } from "@daylily/ui/lib/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@daylily/ui/primitives/dropdown-menu";
import { Ellipsis, FolderOpen, Pin, PinOff, Trash2 } from "lucide-react";
import { TOOL_BUTTON } from "../day/tool-button";

const ITEM =
  "gap-2.25 rounded-row px-2.5 py-2 font-medium text-ink text-ui focus:bg-paper-sunk focus:text-ink";

/**
 * A note's ⋯ menu (Paper 17c): pin it to the top of the list, show its file,
 * or move it to the system's Trash, where it can be restored.
 */
export function NoteMenu({
  pinned,
  onPin,
  onShow,
  onTrash,
}: {
  pinned: boolean;
  onPin: () => void;
  /** Absent for a new note with no file yet. */
  onShow: (() => void) | undefined;
  onTrash: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Note menu"
        className={cn(TOOL_BUTTON, "[-webkit-app-region:no-drag]")}
      >
        <Ellipsis className="size-3.75" strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-55 rounded-lg border border-line bg-paper-page p-1 shadow-card ring-0"
        sideOffset={6}
      >
        <DropdownMenuItem className={ITEM} onClick={onPin}>
          {pinned ? (
            <PinOff className="size-3.5 text-ink-muted" strokeWidth={1.9} />
          ) : (
            <Pin className="size-3.5 text-ink-muted" strokeWidth={1.9} />
          )}
          {pinned ? "Unpin" : "Pin to the top"}
        </DropdownMenuItem>
        {onShow ? (
          <DropdownMenuItem className={ITEM} onClick={onShow}>
            <FolderOpen className="size-3.5 text-ink-muted" strokeWidth={1.9} />
            Show in folder
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator className="mx-1.5 my-1 bg-line" />
        <DropdownMenuItem
          className={cn(
            ITEM,
            "text-daylily-deep focus:text-daylily-deep [&_svg]:text-daylily-deep"
          )}
          onClick={onTrash}
        >
          <Trash2 className="size-3.5" strokeWidth={1.9} />
          Move to Trash
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
