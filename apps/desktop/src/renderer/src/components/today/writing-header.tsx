import { cn } from "@daylily/ui/lib/cn";
import { Maximize, Minimize } from "lucide-react";
import { type ReactNode, useCallback } from "react";
import { fromKey } from "../../lib/month";
import { SealCountdown } from "../seal-countdown";
import { TOOL_BUTTON } from "./tool-button";

const MONTH = new Intl.DateTimeFormat("en", { month: "long" });

/**
 * The writing screen's top bar (Paper: "03 Writing"): where the page sits in the
 * journal, when it seals, focus mode and the page menu.
 */
export function WritingHeader({
  day,
  now,
  focused,
  onFocusChange,
  menu,
  className,
}: {
  day: string;
  now: Date;
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
      <nav
        aria-label="Today’s place in the journal"
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
      <div className="flex items-center gap-1.5 [-webkit-app-region:no-drag]">
        <span className="flex h-7 items-center rounded-full border border-daylily-wash-line bg-daylily-wash px-2.5 text-xs">
          <SealCountdown now={now} />
        </span>
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
