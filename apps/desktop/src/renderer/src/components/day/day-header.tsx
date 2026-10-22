import { cn } from "@daylily/ui/lib/cn";
import { Maximize, Minimize } from "lucide-react";
import { type ReactNode, useCallback } from "react";
import { dateFormat } from "../../lib/format";
import { fromKey } from "../../lib/month";
import { TOOL_BUTTON } from "./tool-button";

const MONTH = dateFormat({ month: "long" });

/**
 * A day's top bar (Paper: "03 Writing", "04a Sealed day"): where the page sits in
 * the journal, its seal, focus mode and the page menu. `leading` holds the sealed
 * day's arrows.
 */
export function DayHeader({
  day,
  leading,
  seal,
  focused,
  onFocusChange,
  menu,
  className,
}: {
  day: string;
  leading?: ReactNode;
  seal?: ReactNode;
  focused: boolean;
  onFocusChange: (focused: boolean) => void;
  menu: ReactNode;
  className?: string;
}) {
  const date = fromKey(day);
  const isMac = window.daylily.platform === "darwin";
  const toggleFocus = useCallback(
    () => onFocusChange(!focused),
    [focused, onFocusChange]
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between bg-paper-page px-5",
        // macOS has no title bar, so the header drags the window there
        isMac && "[-webkit-app-region:drag]",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        {leading}
        <nav
          aria-label="The page’s place in the journal"
          className="flex items-center gap-1.5 text-caption"
        >
          <span className="text-ink-subtle">{date.getFullYear()}</span>
          <span className="text-ink-ghost">/</span>
          <span className="text-ink-subtle">{MONTH.format(date)}</span>
          <span className="text-ink-ghost">/</span>
          <span aria-current="page" className="font-medium text-ink">
            {date.getDate()}
          </span>
        </nav>
      </div>
      <div className="flex items-center gap-1.5 [-webkit-app-region:no-drag]">
        {seal}
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
        {menu}
      </div>
    </header>
  );
}
