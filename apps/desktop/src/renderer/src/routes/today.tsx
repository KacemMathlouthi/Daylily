import type { PageChange } from "@daylily/ui/editor/use-page-editor";
import { cn } from "@daylily/ui/lib/cn";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { CoverPicker } from "../components/today/cover-picker";
import { PageMenu } from "../components/today/page-menu";
import { PageView } from "../components/today/page-view";
import { type SaveState, StatusBar } from "../components/today/status-bar";
import { WritingHeader } from "../components/today/writing-header";
import type { Cover } from "../lib/covers";
import { useFocusMode } from "../lib/focus-mode";
import type { DayKey } from "../lib/month";
import { useGhostPrompts } from "../lib/preferences";
import { updateTodayPage, useTodayPage } from "../lib/today-page";
import { useNow } from "../lib/use-now";
import { useToday } from "../lib/use-today";

export const Route = createFileRoute("/today")({
  component: TodayScreen,
});

/** Matches the autosave to come: kept ~500ms after typing stops. */
const SAVE_DELAY_MS = 500;
const NOTICE_MS = 2500;
/** In focus mode the bars come back on a mouse move, then fade after this long. */
const CHROME_IDLE_MS = 2000;

/** Where the day's file will live, as §3.2 lays the journal out. */
function journalPath(day: DayKey) {
  const [year, month, date] = day.split("-");
  return `~/Journal/${year}/${month}/${date}/${day}.md`;
}

/** "Saving…" while words are arriving, then "Saved". */
function useSaving() {
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const touch = useCallback(() => {
    setSaving(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaving(false), SAVE_DELAY_MS);
  }, []);
  return [saving, touch] as const;
}

/** A short message in the status bar, such as after copying. */
function useNotice() {
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (notice === null) {
      return;
    }
    const timer = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice]);
  return [notice, setNotice] as const;
}

/**
 * Focus mode: the sidebar goes (the shell reads the same flag), the bars fade
 * while you type and return when the mouse moves. Esc leaves it, and so does
 * leaving the screen.
 */
function useFocus() {
  const [focused, setFocused] = useFocusMode();
  const [chromeVisible, setChromeVisible] = useState(true);

  useEffect(() => () => setFocused(false), [setFocused]);

  useEffect(() => {
    if (!focused) {
      setChromeVisible(true);
      return;
    }
    setChromeVisible(false);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reveal = () => {
      setChromeVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setChromeVisible(false), CHROME_IDLE_MS);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        setFocused(false);
        return;
      }
      clearTimeout(timer);
      setChromeVisible(false);
    };
    window.addEventListener("mousemove", reveal);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", reveal);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [focused, setFocused]);

  return { chromeVisible, focused, setFocused };
}

/** Paper's "03 Writing" and its states (03a to 03c): today's page, the only one you can write. */
function TodayScreen() {
  const today = useToday();
  const now = useNow();
  const page = useTodayPage(today);
  const [ghostPrompts, setGhostPrompts] = useGhostPrompts();
  const { chromeVisible, focused, setFocused } = useFocus();
  const [saving, touch] = useSaving();
  const [notice, setNotice] = useNotice();
  const [pickerOpen, setPickerOpen] = useState(false);

  const write = useCallback(
    ({ markdown, words }: PageChange) => {
      updateTodayPage(today, { markdown, words });
      touch();
    },
    [today, touch]
  );
  const retitle = useCallback(
    (title: string) => {
      updateTodayPage(today, { title });
      touch();
    },
    [today, touch]
  );
  const recover = useCallback(
    (cover: Cover | null) => {
      updateTodayPage(today, { cover });
      touch();
    },
    [today, touch]
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

  const isBlank =
    page.words === 0 && page.title.trim() === "" && page.cover === null;
  let save: SaveState = "saved";
  if (isBlank) {
    save = "blank";
  } else if (saving) {
    save = "saving";
  }

  // The bars stay reachable by hover and keyboard while faded
  const chrome = cn(
    "transition-opacity duration-400 ease-soft",
    !chromeVisible && "opacity-0 focus-within:opacity-100 hover:opacity-100"
  );

  return (
    <div className="flex grow flex-col">
      <WritingHeader
        className={chrome}
        day={today}
        focused={focused}
        menu={
          <PageMenu
            ghostPrompts={ghostPrompts}
            onCopy={copy}
            onGhostPromptsChange={setGhostPrompts}
          />
        }
        now={now}
        onFocusChange={setFocused}
      />
      <div className="flex grow justify-center px-8 pt-3 pb-16">
        <article className="flex w-full max-w-170 flex-col">
          <PageView
            ghostPrompts={ghostPrompts}
            key={today}
            onChooseCover={openPicker}
            onTitle={retitle}
            onWrite={write}
            page={page}
          />
        </article>
      </div>
      <StatusBar
        className={chrome}
        ghostPrompts={ghostPrompts}
        notice={notice}
        path={journalPath(today)}
        save={save}
        words={page.words}
      />
      <CoverPicker
        cover={page.cover}
        onChange={recover}
        onOpenChange={setPickerOpen}
        open={pickerOpen}
      />
    </div>
  );
}
