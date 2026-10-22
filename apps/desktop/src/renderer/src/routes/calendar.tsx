import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import {
  CalendarHeader,
  type MonthStats,
} from "../components/calendar/calendar-header";
import { DayCell } from "../components/calendar/day-cell";
import { Page } from "../components/page";
import { type DayKey, monthWeeks } from "../lib/month";
import { useToday } from "../lib/use-today";
import { MOCK_DAYS } from "../mock/journal";

export const Route = createFileRoute("/calendar")({
  component: CalendarScreen,
});

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function statsFor(weeks: ReturnType<typeof monthWeeks>, today: DayKey) {
  const stats: MonthStats = { resting: 0, words: 0, written: 0 };
  for (const day of weeks.flat()) {
    if (!day.inMonth || day.key > today) {
      continue;
    }
    const entry = MOCK_DAYS.get(day.key);
    if (entry) {
      stats.written += 1;
      stats.words += entry.words;
    } else if (day.key < today) {
      stats.resting += 1;
    }
  }
  return stats;
}

/** Paper's "05 Calendar": a month of covers, bare soil for days that rested. */
function CalendarScreen() {
  const today = useToday();
  const [shown, setShown] = useState(() => {
    const [year, month] = today.split("-").map(Number) as [number, number];
    return { month: month - 1, year };
  });

  const weeks = useMemo(
    () => monthWeeks(shown.year, shown.month),
    [shown.year, shown.month]
  );
  const stats = useMemo(() => statsFor(weeks, today), [weeks, today]);

  // Date rolls the month over into the next or previous year
  const move = useCallback((by: number) => {
    setShown(({ year, month }) => {
      const next = new Date(year, month + by, 1);
      return { month: next.getMonth(), year: next.getFullYear() };
    });
  }, []);
  const previous = useCallback(() => move(-1), [move]);
  const next = useCallback(() => move(1), [move]);

  return (
    <Page>
      <CalendarHeader
        month={shown.month}
        onNext={next}
        onPrevious={previous}
        stats={stats}
        year={shown.year}
      />
      <div className="grid grid-cols-7 gap-x-2.5 gap-y-3.5">
        {WEEKDAYS.map((weekday) => (
          <span
            className="pt-1 font-semibold text-ink-faint text-tag uppercase leading-3.5 tracking-caps"
            key={weekday}
          >
            {weekday}
          </span>
        ))}
        {weeks.flat().map((day) => (
          <DayCell
            day={day}
            entry={day.inMonth ? MOCK_DAYS.get(day.key) : undefined}
            key={day.key}
            today={today}
          />
        ))}
      </div>
    </Page>
  );
}
