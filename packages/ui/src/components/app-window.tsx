import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { DaylilyMark } from "./daylily-mark";

type AppWindowProps = ComponentProps<"div"> & {
  title: string;
};

const MENUS = ["File", "Edit", "View", "Help"];

/** The window's minimise, maximise and close glyphs, drawn as the app draws them. */
function WindowControls() {
  return (
    <div aria-hidden="true" className="flex items-stretch text-ink-muted">
      <span className="flex w-11.5 items-center justify-center">
        <svg aria-hidden="true" className="size-2.5" viewBox="0 0 10 10">
          <path
            d="M1 5.5h8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.1"
          />
        </svg>
      </span>
      <span className="flex w-11.5 items-center justify-center">
        <svg aria-hidden="true" className="size-2.5" viewBox="0 0 10 10">
          <rect
            fill="none"
            height="8"
            rx="1.6"
            stroke="currentColor"
            strokeWidth="1.1"
            width="8"
            x="1"
            y="1"
          />
        </svg>
      </span>
      <span className="flex w-11.5 items-center justify-center">
        <svg aria-hidden="true" className="size-2.5" viewBox="0 0 10 10">
          <path
            d="M1.5 1.5l7 7M8.5 1.5l-7 7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.2"
          />
        </svg>
      </span>
    </div>
  );
}

/**
 * A desktop window frame for showing the product in context, with Daylily's own
 * title strip (Paper 12b): the mark and menus, the title, and the window's controls.
 */
export function AppWindow({
  title,
  className,
  children,
  ...props
}: AppWindowProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-clip rounded-xl border border-ink/10 bg-paper-page shadow-window",
        className
      )}
      {...props}
    >
      <div className="relative flex h-9 shrink-0 items-stretch justify-between border-line border-b bg-paper-sunk">
        <div aria-hidden="true" className="flex items-center gap-0.5 pl-3">
          <DaylilyMark className="mr-2 text-daylily" size={15} />
          {MENUS.map((menu) => (
            <span
              className="hidden h-6.5 items-center px-2 text-caption text-ink-soft sm:flex"
              key={menu}
            >
              {menu}
            </span>
          ))}
        </div>
        {/* Too narrow for it beside the controls on phones */}
        <span className="absolute top-0 left-1/2 hidden h-full -translate-x-1/2 items-center whitespace-nowrap text-ink-subtle text-meta sm:flex">
          {title}
        </span>
        <WindowControls />
      </div>
      <div className="flex min-h-0 grow">{children}</div>
    </div>
  );
}
