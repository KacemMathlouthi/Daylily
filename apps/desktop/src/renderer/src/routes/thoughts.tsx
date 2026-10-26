import { cn } from "@daylily/ui/lib/cn";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Maximize, Minimize } from "lucide-react";
import { type MouseEvent, useCallback, useEffect, useRef } from "react";
import type { ThoughtsPage } from "../../../shared/journal";
import { StatusBar } from "../components/day/status-bar";
import { TOOL_BUTTON } from "../components/day/tool-button";
import {
  ThoughtRow,
  UnreadableThoughts,
} from "../components/thoughts/thought-entry";
import { useSaveState } from "../lib/autosave";
import { useFocusChrome } from "../lib/focus-mode";
import { useJournalInfo } from "../lib/journal-info";
import type { DayKey } from "../lib/month";
import { validateFoundThought } from "../lib/search";
import {
  readBackTo,
  receiveThoughts,
  startNextThought,
  thoughtAt,
  thoughtsSaveKey,
  useAllRead,
  useThoughtCount,
  useThoughtEntries,
} from "../lib/thoughts";
import { useNotice } from "../lib/use-notice";
import { useToday } from "../lib/use-today";

export const Route = createFileRoute("/thoughts")({
  component: ThoughtsScreen,
  validateSearch: validateFoundThought,
});

const THOUGHTS_KEY = ["journal", "thoughts"] as const;
/** How far ahead of the bottom the next days are read, so scrolling back never waits. */
const READ_AHEAD = "1200px";

/**
 * Days of thoughts a page at a time, newest first, as the screen scrolls back.
 * Each day read goes to the thoughts store, which the screen shows.
 */
function useThoughtPages() {
  const query = useInfiniteQuery({
    getNextPageParam: (last: ThoughtsPage) => last.next,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => window.daylily.thoughts.page(pageParam),
    queryKey: THOUGHTS_KEY,
    staleTime: Number.POSITIVE_INFINITY,
  });
  const { data } = query;
  useEffect(() => {
    if (!data) {
      return;
    }
    for (const page of data.pages) {
      for (const found of page.days) {
        receiveThoughts(found);
      }
    }
    const last = data.pages.at(-1);
    readBackTo(last?.days.at(-1)?.day ?? null, last?.next === null);
  }, [data]);
  return query;
}

/** Reads the next days when the bottom of the list comes near. */
function useReadOnScroll(
  more: boolean,
  reading: boolean,
  readMore: () => unknown
) {
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = sentinel.current;
    if (!(node && more) || reading) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          readMore();
        }
      },
      // The app scrolls inside its main panel, not the window: watched there, the margin reads ahead
      {
        root: node.closest("[data-slot=sidebar-inset]"),
        rootMargin: `0px 0px ${READ_AHEAD} 0px`,
      }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [more, reading, readMore]);
  return sentinel;
}

/** The status bar's line: a passing notice, a failed save, or where today's thoughts are kept. */
function useSaveLabel(today: DayKey, notice: string | null) {
  const save = useSaveState(thoughtsSaveKey(today));
  const info = useJournalInfo();
  if (notice) {
    return { dot: "bg-ink-ghost", label: notice };
  }
  if (save?.kind === "failed") {
    return { dot: "bg-daylily", label: save.message };
  }
  if (!(save && info)) {
    return {
      dot: "bg-ink-ghost",
      label: "Each thought is saved to your journal from its first word.",
    };
  }
  const [year, month, date] = today.split("-");
  const file = [info.displayRoot, year, month, date, "thoughts.md"].join(
    info.separator
  );
  return {
    dot: save.kind === "saved" ? "bg-moss" : "bg-saffron",
    label: `Saved to ${file}`,
  };
}

/**
 * A thought opened from search (Paper 13d): the days are read back until its
 * day is in, then it's the one to glow. Undefined when nothing was asked for, or
 * once it's clear the thought is gone.
 */
function useFoundThought({
  day,
  place,
  more,
  reading,
  readMore,
  forget,
}: {
  day: string | undefined;
  place: number | undefined;
  more: boolean;
  reading: boolean;
  readMore: () => unknown;
  forget: () => void;
}) {
  const allRead = useAllRead();
  const found =
    day !== undefined && place !== undefined
      ? thoughtAt(day, place)
      : undefined;
  const looking = day !== undefined && found === undefined;
  useEffect(() => {
    if (!looking || reading) {
      return;
    }
    if (allRead) {
      // Every day is in and it isn't there: changed since it was found
      forget();
    } else if (more) {
      readMore();
    }
  }, [allRead, forget, looking, more, readMore, reading]);
  return found;
}

/** Paper's "15 Thoughts": caught as the day goes, newest first, never sealed. */
function ThoughtsScreen() {
  const today = useToday();
  const entries = useThoughtEntries(today);
  const { fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useThoughtPages();
  const readMore = useCallback(() => fetchNextPage(), [fetchNextPage]);
  const search = Route.useSearch();
  const navigate = useNavigate();
  const forgetFound = useCallback(
    () => navigate({ replace: true, search: {}, to: "/thoughts" }),
    [navigate]
  );
  const found = useFoundThought({
    day: search.day,
    forget: forgetFound,
    more: hasNextPage,
    place: search.place,
    reading: isFetchingNextPage || isPending,
    readMore,
  });
  const sentinel = useReadOnScroll(hasNextPage, isFetchingNextPage, readMore);
  const { chrome, focused, setFocused } = useFocusChrome();
  const [notice, setNotice] = useNotice();
  const count = useThoughtCount(today);
  const { dot, label } = useSaveLabel(today, notice);

  // The open thought takes the cursor as the screen opens, and again each new
  // day; opened from search, the screen goes to what was found instead
  const fromSearch = useRef(search.day !== undefined);
  useEffect(() => {
    if (fromSearch.current) {
      fromSearch.current = false;
      return;
    }
    startNextThought(today);
  }, [today]);

  const writeOnPaper = useCallback(
    (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest("article")) {
        startNextThought(today);
      }
    },
    [today]
  );

  const isMac = window.daylily.platform === "darwin";
  const toggleFocus = useCallback(
    () => setFocused(!focused),
    [focused, setFocused]
  );

  return (
    <div className="flex grow flex-col">
      <header
        className={cn(
          "sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between bg-paper-page px-5",
          isMac && "[-webkit-app-region:drag]",
          chrome
        )}
      >
        <h1 className="font-medium text-caption text-ink">Thoughts</h1>
        <button
          aria-label={focused ? "Leave focus mode" : "Focus mode"}
          aria-pressed={focused}
          className={cn(TOOL_BUTTON, "[-webkit-app-region:no-drag]")}
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
      </header>
      {/* A click on the paper itself, not on a thought, goes to the thought being written */}
      {/* biome-ignore lint/a11y: the keyboard reaches the open thought by itself; this is a convenience for the mouse */}
      <div
        className="flex grow cursor-text justify-center px-8 pt-7.5 pb-24"
        onClick={writeOnPaper}
      >
        {/* The lane hangs in the margin, so the words sit where the page's do */}
        <div className="flex w-full max-w-254 flex-col gap-14 xl:pr-42">
          {entries.map((entry, index) =>
            entry.kind === "thought" ? (
              <ThoughtRow
                day={entry.day}
                find={entry.thought.id === found ? search.find : undefined}
                // A day read again from its file gets new ids, so its editors start over
                key={entry.thought.id}
                newest={index === 0 && entry.day === today}
                onFound={forgetFound}
                onProblem={setNotice}
                thought={entry.thought}
                today={today}
              />
            ) : (
              <UnreadableThoughts
                day={entry.day}
                key={`unreadable:${entry.day}`}
                today={today}
              />
            )
          )}
          <div aria-hidden="true" ref={sentinel} />
        </div>
      </div>
      <StatusBar className={chrome} dot={dot} label={label}>
        <span>
          {count} {count === 1 ? "thought" : "thoughts"} today
        </span>
      </StatusBar>
    </div>
  );
}
