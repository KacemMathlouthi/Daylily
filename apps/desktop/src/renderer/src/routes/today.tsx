import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import type { PageChange } from "@daylily/ui/editor/use-page-editor";
import { cn } from "@daylily/ui/lib/cn";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { DayHeader } from "../components/day/day-header";
import { PageMenu } from "../components/day/page-menu";
import { CountdownPill, SealedPill } from "../components/day/seal-pill";
import { StatusBar, wordCount } from "../components/day/status-bar";
import { CoverPicker } from "../components/today/cover-picker";
import { PageView } from "../components/today/page-view";
import type { Cover } from "../lib/covers";
import { useFocusChrome } from "../lib/focus-mode";
import type { DayKey } from "../lib/month";
import { useGhostPrompts } from "../lib/preferences";
import {
  type TodayPage,
  updateTodayPage,
  useTodayPage,
} from "../lib/today-page";
import { useNotice } from "../lib/use-notice";
import { useNow } from "../lib/use-now";
import { useToday } from "../lib/use-today";

export const Route = createFileRoute("/today")({
  component: TodayScreen,
});

/**
 * Paper's "04c Seal at 4am": the ink settles, the sealed page steps back, then a
 * new one rises in.
 */
type Phase = "writing" | "sealing" | "leaving" | "arriving";
const SETTLE_MS = 600;
const LEAVE_MS = 500;
const ARRIVE_MS = 500;

function isBlank(page: TodayPage) {
  return page.words === 0 && page.title.trim() === "" && page.cover === null;
}

/**
 * The day on screen, which trails today by the length of the seal when the
 * boundary passes with the page open. A blank page, or reduced motion, turns over
 * at once.
 */
function useSealTransition(today: DayKey) {
  const [shownDay, setShownDay] = useState(today);
  const [phase, setPhase] = useState<Phase>("writing");
  const shownPage = useTodayPage(shownDay);
  const shownBlank = isBlank(shownPage);

  useEffect(() => {
    if (today === shownDay) {
      return;
    }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || shownBlank) {
      setShownDay(today);
      return;
    }
    setPhase("sealing");
    const leave = setTimeout(() => setPhase("leaving"), SETTLE_MS);
    const arrive = setTimeout(() => {
      setShownDay(today);
      setPhase("arriving");
    }, SETTLE_MS + LEAVE_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(arrive);
    };
  }, [today, shownDay, shownBlank]);

  useEffect(() => {
    if (phase !== "arriving") {
      return;
    }
    const settled = setTimeout(() => setPhase("writing"), ARRIVE_MS);
    return () => clearTimeout(settled);
  }, [phase]);

  return { phase, shownDay, shownPage };
}

/** Paper's "03 Writing" and its states (03a to 03c): today's page, the only one you can write. */
function TodayScreen() {
  const today = useToday();
  const now = useNow();
  const { phase, shownDay, shownPage: page } = useSealTransition(today);
  const sealed = phase === "sealing" || phase === "leaving";
  const [ghostPrompts, setGhostPrompts] = useGhostPrompts();
  const { chrome, focused, setFocused } = useFocusChrome();
  const [notice, setNotice] = useNotice();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [promptSlot, setPromptSlot] = useState<HTMLDivElement | null>(null);

  const write = useCallback(
    ({ markdown, words }: PageChange) => {
      updateTodayPage(shownDay, { markdown, words });
    },
    [shownDay]
  );
  const retitle = useCallback(
    (title: string) => {
      updateTodayPage(shownDay, { title });
    },
    [shownDay]
  );
  const recover = useCallback(
    (cover: Cover | null) => {
      updateTodayPage(shownDay, { cover });
    },
    [shownDay]
  );
  const openPicker = useCallback(() => setPickerOpen(true), []);

  const copy = useCallback(async () => {
    const title = page.title.trim();
    const markdown = [title && `# ${title}`, page.markdown]
      .filter(Boolean)
      .join("\n\n")
      .trim();
    await navigator.clipboard.writeText(markdown);
    setNotice("Today’s page is copied as markdown.");
  }, [page.markdown, page.title, setNotice]);

  const blank = isBlank(page);
  // Until storage exists, words live only in memory, and the bar says so
  const label =
    notice ??
    (blank
      ? "Today’s page is saved to your journal from the first word."
      : "Not saved yet: kept in memory until Daylily writes to your journal.");

  return (
    <div className="flex grow flex-col">
      <DayHeader
        className={chrome}
        day={shownDay}
        focused={focused}
        menu={
          <PageMenu
            ghostPrompts={{ on: ghostPrompts, onChange: setGhostPrompts }}
            onCopy={copy}
          />
        }
        onFocusChange={setFocused}
        seal={
          sealed ? (
            <SealedPill label="Sealed just now" />
          ) : (
            <CountdownPill now={now} />
          )
        }
      />
      <div className="flex grow justify-center px-8 pt-3 pb-16">
        <article
          className={cn(
            "flex w-full max-w-170 flex-col transition-[opacity,translate] duration-500 ease-soft",
            phase === "leaving" && "-translate-y-2.5 opacity-0",
            phase === "arriving" && "motion-safe:animate-rise-in"
          )}
        >
          <PageView
            ghostPrompts={ghostPrompts}
            key={shownDay}
            onChooseCover={openPicker}
            onTitle={retitle}
            onWrite={write}
            page={page}
            promptSlot={promptSlot}
            sealed={sealed}
          />
        </article>
      </div>
      {/* Sticks above the status bar, centred on the page column */}
      <div
        className="pointer-events-none sticky bottom-13 z-20 flex justify-center *:pointer-events-auto"
        ref={setPromptSlot}
      />
      <StatusBar
        className={chrome}
        dot={blank ? "bg-ink-ghost" : "bg-saffron"}
        label={label}
      >
        <span className="flex items-center gap-1.5">
          <DaylilyMark
            className={ghostPrompts ? "text-daylily/50" : "text-ink-ghost"}
            size={12}
          />
          Ghost prompts {ghostPrompts ? "on" : "off"}
        </span>
        <span>{wordCount(page.words)}</span>
      </StatusBar>
      <CoverPicker
        cover={page.cover}
        onChange={recover}
        onOpenChange={setPickerOpen}
        open={pickerOpen}
      />
    </div>
  );
}
