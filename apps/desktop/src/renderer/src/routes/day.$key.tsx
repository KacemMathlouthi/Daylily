import { createFileRoute, redirect } from "@tanstack/react-router";
import { useCallback } from "react";
import { DayArrows } from "../components/day/day-arrows";
import { DayHeader } from "../components/day/day-header";
import { PageMenu } from "../components/day/page-menu";
import { RestedPage } from "../components/day/rested-page";
import { EditedMark, SealedPill } from "../components/day/seal-pill";
import { SealedPage } from "../components/day/sealed-page";
import { StatusBar, wordCount } from "../components/day/status-bar";
import { UnreadablePage } from "../components/day/unreadable-page";
import { sealedLabel, useNeighbours, usePastDay } from "../lib/days";
import { useFocusChrome } from "../lib/focus-mode";
import { dayFileLabel, useJournalInfo } from "../lib/journal-info";
import { dayKey, fromKey, todayKey } from "../lib/month";
import { validateFind } from "../lib/search";
import { useNotice } from "../lib/use-notice";
import { useToday } from "../lib/use-today";

const KEY_SHAPE = /^\d{4}-\d{2}-\d{2}$/;

/** A real calendar date: `2026-02-30` reads back as March, so it isn't one. */
function isDayKey(key: string) {
  return KEY_SHAPE.test(key) && dayKey(fromKey(key)) === key;
}

export const Route = createFileRoute("/day/$key")({
  // Only past days are sealed; today and anything ahead belong to the writing page
  beforeLoad: ({ params }) => {
    if (!isDayKey(params.key) || params.key >= todayKey(new Date())) {
      throw redirect({ to: "/today" });
    }
  },
  component: SealedDayScreen,
  validateSearch: validateFind,
});

/**
 * Paper's "04a Sealed day", "04b Rested day", "04d" edited outside Daylily and
 * "04e" a file that can't be read: a past day, read-only.
 */
function SealedDayScreen() {
  const { key } = Route.useParams();
  const { find } = Route.useSearch();
  const today = useToday();
  const day = usePastDay(key);
  const { previous, next } = useNeighbours(key, today);
  const { chrome, focused, setFocused } = useFocusChrome();
  const [notice, setNotice] = useNotice();

  const markdown = day.kind === "written" ? day.markdown : "";
  const title = day.kind === "written" ? day.title.trim() : "";
  const copy = useCallback(async () => {
    const text = [title && `# ${title}`, markdown]
      .filter(Boolean)
      .join("\n\n")
      .trim();
    await navigator.clipboard.writeText(text);
    setNotice("The page is copied as markdown.");
  }, [markdown, setNotice, title]);

  const info = useJournalInfo();
  const file = info ? dayFileLabel(info, key) : "in your journal";
  let label = "A rested day · nothing in your journal for it";
  if (day.kind === "written") {
    label = day.edited
      ? `Read-only · ${file} · changed in another app after it sealed`
      : `Read-only · ${file}`;
  } else if (day.kind === "unreadable") {
    label = `${file} · can’t be read`;
  }

  return (
    <div className="flex grow flex-col">
      <DayHeader
        className={chrome}
        day={key}
        focused={focused}
        leading={<DayArrows next={next} previous={previous} />}
        menu={day.kind === "written" ? <PageMenu onCopy={copy} /> : null}
        onFocusChange={setFocused}
        seal={
          day.kind === "written" ? (
            <>
              {day.edited ? <EditedMark /> : null}
              <SealedPill label={sealedLabel(key, today)} />
            </>
          ) : null
        }
      />
      <div className="flex grow justify-center px-8 pt-3 pb-16">
        <article className="flex w-full max-w-170 flex-col">
          {day.kind === "written" ? (
            <SealedPage
              day={key}
              find={find}
              key={`${key}:${day.revision}`}
              page={day}
            />
          ) : null}
          {day.kind === "rested" ? <RestedPage day={key} /> : null}
          {day.kind === "unreadable" ? <UnreadablePage day={key} /> : null}
        </article>
      </div>
      <StatusBar
        className={chrome}
        dot="bg-ink-ghost"
        label={notice ?? (day.kind === "loading" ? "" : label)}
      >
        {day.kind === "written" ? <span>{wordCount(day.words)}</span> : null}
      </StatusBar>
    </div>
  );
}
