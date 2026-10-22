import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useMemo } from "react";
import dusk from "../assets/dusk.jpg";
import { GardenGlance } from "../components/home/garden-glance";
import { OnThisDay } from "../components/home/on-this-day";
import { ThisWeek } from "../components/home/this-week";
import { TodayCard } from "../components/home/today-card";
import { Page } from "../components/page";
import { dateFormat } from "../lib/format";
import { gardenGrid } from "../lib/garden";
import { greetingFor } from "../lib/greeting";
import { type DayKey, dayKey, fromKey } from "../lib/month";
import { useTodayPage } from "../lib/today-page";
import { useNow } from "../lib/use-now";
import { useToday } from "../lib/use-today";
import { MOCK_DAYS } from "../mock/journal";

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

function useGlance(today: DayKey) {
  return useMemo(() => {
    const now = fromKey(today);
    const end = shift(today, 6 - ((now.getDay() + 6) % 7));
    const start = shift(dayKey(end), -GLANCE_WEEKS * 7 + 1);
    const grid = gardenGrid(start, end, today, MOCK_DAYS);

    const written = grid.keys
      .map((key) => (key <= today ? MOCK_DAYS.get(key) : undefined))
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
        weekWritten: week.filter((key) => MOCK_DAYS.has(key)).length,
      },
      week,
    };
  }, [today]);
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
  const { grid, stats, week } = useGlance(today);
  const yearAgo = fromKey(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const memoryKey = dayKey(yearAgo);
  const memory = MOCK_DAYS.get(memoryKey);

  return (
    <Page
      backdrop={
        <img
          alt=""
          className="mask-[linear-gradient(black,black_45%,transparent)] pointer-events-none absolute inset-x-0 top-0 h-82.5 w-full object-cover object-[center_62%]"
          height={941}
          src={dusk}
          width={1672}
        />
      }
      className="gap-7 pt-17.5"
      corner={
        <Link
          aria-label="Reminders"
          className="light flex size-7.5 items-center justify-center rounded-md bg-paper-page/60 text-ink-soft backdrop-blur-md transition-colors hover:bg-paper-page/85 hover:text-ink"
          search={{ section: "reminders" }}
          to="/settings"
        >
          <Bell className="size-3.75" strokeWidth={1.9} />
        </Link>
      }
      narrow
    >
      {/* Light in both themes: it sits on the meadow, which keeps its daylight colours */}
      <header className="light flex flex-col gap-1.5">
        <p className="font-medium text-ink-soft text-ui">
          {/* The journal's day, which turns at 4am, and the clock's time */}
          {DATE.format(fromKey(today))} · {TIME.format(now).toLowerCase()}
        </p>
        <h1 className="font-display text-display text-ink leading-15 tracking-heading">
          {greetingFor(now, info?.userName)}
        </h1>
      </header>

      <TodayCard
        now={now}
        written={MOCK_DAYS.has(today) || todayPage.words > 0}
      />

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

      <ThisWeek days={week} entries={MOCK_DAYS} />
    </Page>
  );
}
