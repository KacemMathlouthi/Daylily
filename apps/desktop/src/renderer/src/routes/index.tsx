import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useMemo } from "react";
import { GardenGlance } from "../components/home/garden-glance";
import { OnThisDay } from "../components/home/on-this-day";
import { ThisWeek } from "../components/home/this-week";
import { TodayCard } from "../components/home/today-card";
import { Page } from "../components/page";
import { dateFormat } from "../lib/format";
import { gardenGrid } from "../lib/garden";
import { greetingFor } from "../lib/greeting";
import { type JournalDay, useJournalDays } from "../lib/journal";
import { type DayKey, dayKey, fromKey } from "../lib/month";
import { useTodayPage } from "../lib/today-page";
import { useNow } from "../lib/use-now";
import { useToday } from "../lib/use-today";

export const Route = createFileRoute("/")({
  component: HomeScreen,
});

/** Home's garden shows the last half year, a week per column. */
const GLANCE_WEEKS = 26;

const DATE = dateFormat({
  day: "numeric",
  month: "long",
  weekday: "long",
});
const TIME = dateFormat({
  hour: "numeric",
  minute: "2-digit",
});
const MONTH = dateFormat({ month: "long" });

function shift(key: DayKey, days: number) {
  const date = fromKey(key);
  date.setDate(date.getDate() + days);
  return date;
}

function useGlance(today: DayKey, days: ReadonlyMap<DayKey, JournalDay>) {
  return useMemo(() => {
    const now = fromKey(today);
    const end = shift(today, 6 - ((now.getDay() + 6) % 7));
    const start = shift(dayKey(end), -GLANCE_WEEKS * 7 + 1);
    const grid = gardenGrid(start, end, today, days);

    const written = grid.keys
      .map((key) => (key <= today ? days.get(key) : undefined))
      .filter((day) => day !== undefined);
    const week = Array.from({ length: 6 }, (_, index) =>
      dayKey(shift(today, index - 6))
    );

    return {
      grid,
      stats: {
        averageWords: written.length
          ? Math.round(
              written.reduce((sum, day) => sum + day.words, 0) / written.length
            )
          : 0,
        flowers: written.length,
        since: MONTH.format(start),
        weekWritten: week.filter((key) => days.has(key)).length,
      },
      week,
    };
  }, [days, today]);
}

/** Paper's "02 Home": a greeting, today's invitation, the garden and the week. */
function HomeScreen() {
  const now = useNow();
  const today = useToday();
  const todayPage = useTodayPage(today);
  const { data: info } = useQuery({
    queryFn: () => window.daylily.app.info(),
    queryKey: ["app", "info"],
  });
  const days = useJournalDays();
  const { grid, stats, week } = useGlance(today, days);
  const yearAgo = fromKey(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const memoryKey = dayKey(yearAgo);
  const remembered = days.get(memoryKey);
  // A day that can't be read has nothing to show here yet
  const memory = remembered?.state === "unreadable" ? undefined : remembered;

  return (
    <Page
      className="gap-7 pt-17.5"
      corner={
        <Link
          aria-label="Reminders"
          className="flex size-7.5 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-paper-tint hover:text-ink"
          search={{ section: "reminders" }}
          to="/settings"
        >
          <Bell className="size-3.75" strokeWidth={1.9} />
        </Link>
      }
      narrow
    >
      <header className="flex flex-col gap-1.5">
        <p className="font-medium text-ink-soft text-ui">
          {/* The journal's day, which turns at 4am, and the clock's time */}
          {DATE.format(fromKey(today))} · {TIME.format(now).toLowerCase()}
        </p>
        <h1 className="font-display text-display text-ink leading-15 tracking-heading">
          {greetingFor(now, info?.userName)}
        </h1>
      </header>

      <TodayCard now={now} written={days.has(today) || todayPage.words > 0} />

      <div
        className={
          memory
            ? "grid grid-cols-[minmax(0,1.52fr)_minmax(0,1fr)] gap-5"
            : "grid"
        }
      >
        <GardenGlance grid={grid} stats={stats} />
        {memory ? <OnThisDay day={memory} dayKey={memoryKey} /> : null}
      </div>

      <ThisWeek days={week} entries={days} />
    </Page>
  );
}
