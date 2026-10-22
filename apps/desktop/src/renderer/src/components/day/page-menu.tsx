import { Menu } from "@base-ui/react/menu";
import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { cn } from "@daylily/ui/lib/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@daylily/ui/primitives/dropdown-menu";
import { Copy, Ellipsis } from "lucide-react";
import { TOOL_BUTTON } from "./tool-button";

const ITEM =
  "gap-2.25 rounded-row px-2.5 py-2 font-medium text-ink text-ui focus:bg-paper-sunk focus:text-ink";

/**
 * A page's ⋯ menu (Paper: "03b"): copy the page out and, while writing, the
 * nudges on or off. A sealed day only copies.
 */
export function PageMenu({
  onCopy,
  ghostPrompts,
}: {
  onCopy: () => void;
  ghostPrompts?: { on: boolean; onChange: (on: boolean) => void };
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Page menu" className={TOOL_BUTTON}>
        <Ellipsis className="size-3.75" strokeWidth={2} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 rounded-lg border border-line bg-paper-page p-1 shadow-card ring-0"
        sideOffset={6}
      >
        <DropdownMenuItem className={ITEM} onClick={onCopy}>
          <Copy className="size-3.5 text-ink-muted" strokeWidth={1.9} />
          Copy as markdown
        </DropdownMenuItem>
        {ghostPrompts ? (
          <>
            <DropdownMenuSeparator className="mx-1.5 my-1 bg-line" />
            <Menu.CheckboxItem
              checked={ghostPrompts.on}
              className={cn(
                "group flex cursor-default select-none items-center outline-hidden",
                ITEM
              )}
              closeOnClick={false}
              onCheckedChange={ghostPrompts.onChange}
            >
              <DaylilyMark className="shrink-0 text-daylily/50" size={14} />
              <span className="grow">Ghost prompts</span>
              {/* A switch to look at; the whole row is the control */}
              <span className="flex h-4 w-7 shrink-0 items-center rounded-full bg-ink/10 p-0.5 transition-colors duration-200 group-data-checked:bg-daylily">
                <span className="size-3 rounded-full bg-paper-page shadow-hairline transition-transform duration-200 ease-soft group-data-checked:translate-x-3" />
              </span>
            </Menu.CheckboxItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
