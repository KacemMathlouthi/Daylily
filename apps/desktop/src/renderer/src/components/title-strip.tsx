import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { cn } from "@daylily/ui/lib/cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@daylily/ui/primitives/dropdown-menu";
import { useSidebar } from "@daylily/ui/primitives/sidebar";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Fragment, useCallback, useEffect, useState } from "react";
import type { WindowAction } from "../../../shared/channels";
import { openSearch } from "../lib/search";
import { useTheme } from "../lib/theme";

/** Paper's "12b": 36px, the sidebar's paper, a hairline beneath. */
export const TITLE_STRIP_HEIGHT = "2.25rem";

const ITEM =
  "justify-between gap-6 rounded-row px-2.5 py-1.75 text-ink text-ui focus:bg-paper-sunk focus:text-ink";
const SHORTCUT = "text-ink-faint text-xs";
const NO_DRAG = "[-webkit-app-region:no-drag]";

interface MenuItem {
  label: string;
  run: () => void;
  shortcut?: string;
}
/** A menu's items, in groups split by dividers. */
type MenuGroups = MenuItem[][];

const SCREENS: Record<string, string> = {
  "/": "Home",
  "/calendar": "Calendar",
  "/garden": "Garden",
  "/settings": "Settings",
  "/today": "Today",
};

/** "Your journal · Home": where you are, as the window's title. */
function useWindowTitle() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const screen = path.startsWith("/day/") ? "A past day" : SCREENS[path];
  return screen ? `Your journal · ${screen}` : "Your journal";
}

function useMaximized() {
  const [maximized, setMaximized] = useState(false);
  useEffect(() => {
    window.daylily.window.isMaximized().then(setMaximized);
    return window.daylily.window.onMaximizedChange(setMaximized);
  }, []);
  return maximized;
}

function useMenus(): [string, MenuGroups][] {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const act = (action: WindowAction) => () => {
    window.daylily.window.act(action);
  };
  return [
    [
      "File",
      [
        [
          {
            label: "New page",
            run: () => navigate({ to: "/today" }),
            shortcut: "Ctrl N",
          },
        ],
        [
          {
            label: "Show journal folder",
            run: () => {
              window.daylily.journal.show();
            },
          },
          {
            label: "Change folder…",
            run: () => {
              window.daylily.journal.change();
            },
          },
        ],
        [
          {
            label: "Settings",
            run: () =>
              navigate({ search: { section: "journal" }, to: "/settings" }),
            shortcut: "Ctrl ,",
          },
        ],
        [{ label: "Quit Daylily", run: act("quit") }],
      ],
    ],
    [
      "Edit",
      [
        [
          { label: "Undo", run: act("undo"), shortcut: "Ctrl Z" },
          { label: "Redo", run: act("redo"), shortcut: "Ctrl Y" },
        ],
        [
          { label: "Cut", run: act("cut"), shortcut: "Ctrl X" },
          { label: "Copy", run: act("copy"), shortcut: "Ctrl C" },
          { label: "Paste", run: act("paste"), shortcut: "Ctrl V" },
          { label: "Select all", run: act("selectAll"), shortcut: "Ctrl A" },
        ],
        [{ label: "Search days…", run: openSearch, shortcut: "Ctrl K" }],
      ],
    ],
    [
      "View",
      [
        [
          { label: "Sidebar", run: toggleSidebar, shortcut: "Ctrl B" },
          {
            label: theme === "dark" ? "Light mode" : "Dark mode",
            run: toggleTheme,
          },
        ],
        [
          { label: "Zoom in", run: act("zoom-in"), shortcut: "Ctrl +" },
          { label: "Zoom out", run: act("zoom-out"), shortcut: "Ctrl −" },
          { label: "Actual size", run: act("zoom-reset"), shortcut: "Ctrl 0" },
        ],
      ],
    ],
    [
      "Help",
      [
        [
          {
            label: "About Daylily",
            run: () =>
              navigate({ search: { section: "about" }, to: "/settings" }),
          },
        ],
      ],
    ],
  ];
}

function StripMenu({ label, groups }: { label: string; groups: MenuGroups }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex h-6.5 items-center rounded-md px-2 text-caption text-ink-soft transition-colors duration-150 hover:bg-ink/6 hover:text-ink data-popup-open:bg-ink/8 data-popup-open:text-ink",
          NO_DRAG
        )}
      >
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60 rounded-lg border border-line bg-paper-page p-1 shadow-card ring-0"
        sideOffset={5}
      >
        {groups.map((group, index) => (
          <Fragment key={group[0]?.label}>
            {index > 0 ? (
              <DropdownMenuSeparator className="mx-1.5 my-1 bg-line" />
            ) : null}
            {group.map((item) => (
              <DropdownMenuItem
                className={ITEM}
                key={item.label}
                onClick={item.run}
              >
                <span>{item.label}</span>
                {item.shortcut ? (
                  <span className={SHORTCUT}>{item.shortcut}</span>
                ) : null}
              </DropdownMenuItem>
            ))}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const CONTROL =
  "flex w-11.5 items-center justify-center text-ink-muted transition-colors duration-150";

function WindowControls() {
  const maximized = useMaximized();
  const minimize = useCallback(() => window.daylily.window.act("minimize"), []);
  const toggle = useCallback(
    () => window.daylily.window.act("toggle-maximize"),
    []
  );
  const close = useCallback(() => window.daylily.window.act("close"), []);
  return (
    <div className={cn("flex items-stretch", NO_DRAG)}>
      <button
        aria-label="Minimise"
        className={cn(CONTROL, "hover:bg-ink/6 hover:text-ink")}
        onClick={minimize}
        type="button"
      >
        <svg aria-hidden="true" className="size-2.5" viewBox="0 0 10 10">
          <path
            d="M1 5.5h8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.1"
          />
        </svg>
      </button>
      <button
        aria-label={maximized ? "Restore" : "Maximise"}
        className={cn(CONTROL, "hover:bg-ink/6 hover:text-ink")}
        onClick={toggle}
        type="button"
      >
        <svg aria-hidden="true" className="size-2.5" viewBox="0 0 10 10">
          {maximized ? (
            <>
              <rect
                fill="none"
                height="6.5"
                rx="1.4"
                stroke="currentColor"
                strokeWidth="1.1"
                width="6.5"
                x="1"
                y="2.5"
              />
              <path
                d="M3 1h4.6A1.4 1.4 0 0 1 9 2.4V7"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.1"
              />
            </>
          ) : (
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
          )}
        </svg>
      </button>
      <button
        aria-label="Close"
        className={cn(CONTROL, "hover:bg-daylily hover:text-white")}
        onClick={close}
        type="button"
      >
        <svg aria-hidden="true" className="size-2.5" viewBox="0 0 10 10">
          <path
            d="M1.5 1.5l7 7M8.5 1.5l-7 7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.2"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * Paper's "12b Window · slim title strip": Daylily's own title bar on Windows
 * and Linux, where the window has no frame. The mark and menus, the title, and
 * the window's controls; the rest of the strip drags the window, and a double
 * click maximises it. macOS keeps its traffic lights instead.
 */
export function TitleStrip() {
  const title = useWindowTitle();
  const menus = useMenus();
  return (
    <header
      className="fixed inset-x-0 top-0 z-30 flex select-none items-stretch justify-between border-line border-b bg-sidebar [-webkit-app-region:drag]"
      style={{ height: TITLE_STRIP_HEIGHT }}
    >
      <div className="flex items-center gap-0.5 pl-3">
        <DaylilyMark className="mr-2 text-daylily" size={15} />
        {menus.map(([label, groups]) => (
          <StripMenu groups={groups} key={label} label={label} />
        ))}
      </div>
      {/*
       * Centred on the window, whatever the menus' width, and only as wide as its
       * words: Windows hit-tests drag regions by layout, not pointer-events, so a
       * full-width overlay would turn the menus and controls into drag handles.
       */}
      <span className="pointer-events-none absolute top-0 left-1/2 flex h-full -translate-x-1/2 items-center whitespace-nowrap text-ink-subtle text-meta">
        {title}
      </span>
      <WindowControls />
    </header>
  );
}
