"use client";

import { cn } from "@daylily/ui/lib/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { type Day, TODAY, WEEKDAYS, WEEKS } from "./calendar-days";

const LAST_WEEK = WEEKS.length - 1;

function DayRow({ day, weekday }: { day: Day; weekday: string }) {
  const isToday = day.date === TODAY;

  return (
    <li className="flex items-center gap-4 py-2">
      {"cover" in day ? (
        <div
          className={cn(
            "relative h-18.5 w-28 shrink-0 overflow-clip rounded-xl",
            isToday &&
              "ring-[1.5px] ring-daylily ring-offset-2 ring-offset-paper-page"
          )}
        >
          <Image
            alt={day.alt}
            className="object-cover"
            fill
            sizes="112px"
            src={`/images/covers/${day.cover}.jpg`}
          />
        </div>
      ) : (
        <div
          className={cn(
            "flex h-18.5 w-28 shrink-0 items-center justify-center rounded-xl",
            "resting" in day
              ? "bg-paper-sunk"
              : "border border-line-strong border-dashed"
          )}
        >
          {"resting" in day ? (
            <span className="size-1.75 rounded-full bg-soil-soft" />
          ) : null}
        </div>
      )}
      <div className="flex min-w-0 flex-col gap-0.75">
        <span
          className={cn(
            "font-semibold text-meta uppercase tracking-caps",
            isToday ? "text-daylily-deep" : "text-ink-faint"
          )}
        >
          {weekday} {day.date}
        </span>
        {"title" in day ? (
          <span className="truncate font-display text-ink text-lede leading-6.5">
            {day.title}
          </span>
        ) : null}
        {"resting" in day ? (
          <span className="text-ink-faint text-ui">Resting</span>
        ) : null}
      </div>
    </li>
  );
}

/**
 * The calendar on a phone: one week at a time as a list, the arrows moving
 * between the weeks (Paper: "Calendar · week · mobile"). Opens on today's week.
 */
export function CalendarWeek() {
  const [week, setWeek] = useState(LAST_WEEK);
  const previous = useCallback(() => setWeek((w) => Math.max(0, w - 1)), []);
  const next = useCallback(
    () => setWeek((w) => Math.min(LAST_WEEK, w + 1)),
    []
  );
  const days = WEEKS[week] ?? [];
  const first = days[0]?.date;
  const last = days.at(-1)?.date;

  return (
    <div className="flex flex-col gap-1.5 rounded-3xl border border-line bg-paper-page px-4 pt-5 pb-3 shadow-panel">
      <div className="flex items-center justify-between pb-2">
        <h3
          aria-live="polite"
          className="flex items-baseline gap-2 font-display text-title-sm"
        >
          <span className="text-ink">
            Oct {first} – {last}
          </span>
          <span className="text-on-ink-muted">2026</span>
        </h3>
        <div className="flex items-center gap-1.5 text-ink-muted">
          <button
            aria-label="Previous week"
            className="flex size-8.5 items-center justify-center rounded-lg border border-line disabled:text-ink-ghost"
            disabled={week === 0}
            onClick={previous}
            type="button"
          >
            <ChevronLeft size={14} strokeWidth={2} />
          </button>
          <button
            aria-label="Next week"
            className="flex size-8.5 items-center justify-center rounded-lg border border-line disabled:text-ink-ghost"
            disabled={week === LAST_WEEK}
            onClick={next}
            type="button"
          >
            <ChevronRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
      <ul className="flex flex-col">
        {days.map((day, index) => (
          <DayRow day={day} key={day.date} weekday={WEEKDAYS[index] ?? ""} />
        ))}
      </ul>
    </div>
  );
}
