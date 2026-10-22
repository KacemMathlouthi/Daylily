import { cn } from "@daylily/ui/lib/cn";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { dateFormat } from "../../lib/format";
import type { CalendarDay, DayKey } from "../../lib/month";
import type { MockDay } from "../../mock/journal";

const MONTH_SHORT = dateFormat({ month: "short" });

/** Bare soil for missed days, a cover for written ones, an open frame for days to come. */
type Look = "outside" | "written" | "resting" | "future";

function lookOf(
  day: CalendarDay,
  today: DayKey,
  entry: MockDay | undefined
): Look {
  if (!day.inMonth) {
    return "outside";
  }
  // A day ahead can't hold writing yet; only today and the past show a cover
  if (entry && day.key <= today) {
    return "written";
  }
  // Today stays open until it's written; it never reads as missed
  return day.key < today ? "resting" : "future";
}

/** Past days open as sealed or rested pages, today opens the writing page. */
function DayLink({
  look,
  dayKey,
  isToday,
  children,
}: {
  look: Look;
  dayKey: DayKey;
  isToday: boolean;
  children: ReactNode;
}) {
  const className = "group flex min-w-0 flex-col gap-1.75 rounded-md";
  if (isToday) {
    return (
      <Link className={className} to="/today">
        {children}
      </Link>
    );
  }
  if (look === "written" || look === "resting") {
    return (
      <Link className={className} params={{ key: dayKey }} to="/day/$key">
        {children}
      </Link>
    );
  }
  return <div className="flex min-w-0 flex-col gap-1.75">{children}</div>;
}

/** One day in the month grid, as in Paper's "05 Calendar". */
export function DayCell({
  day,
  today,
  entry,
}: {
  day: CalendarDay;
  today: DayKey;
  entry: MockDay | undefined;
}) {
  const look = lookOf(day, today, entry);
  const isToday = day.key === today && day.inMonth;
  // The next month's first day names its month, so the row doesn't read "31, 1"
  const number =
    !day.inMonth && day.day === 1
      ? `${MONTH_SHORT.format(new Date(`${day.key}T12:00`))} 1`
      : String(day.day);

  return (
    <DayLink dayKey={day.key} isToday={isToday} look={look}>
      <div
        className={cn(
          "flex aspect-19/12 w-full items-center justify-center overflow-hidden rounded-md transition-[filter] duration-200 group-hover:brightness-105",
          look === "outside" && "bg-paper-sunk/45",
          look === "resting" && "bg-paper-tint",
          look === "future" && "border border-line-strong border-dashed",
          isToday &&
            "ring-[1.5px] ring-daylily ring-offset-2 ring-offset-paper-page"
        )}
      >
        {look === "written" && entry ? (
          <img
            alt=""
            className="size-full object-cover"
            draggable={false}
            height={404}
            src={entry.cover}
            width={640}
          />
        ) : null}
        {look === "resting" ? (
          <span className="size-1.5 rounded-full bg-soil-soft" />
        ) : null}
      </div>
      <div className="flex min-w-0 items-baseline gap-1.5">
        <span
          className={cn(
            "font-semibold text-meta leading-3.5",
            look === "written" || look === "resting"
              ? "text-ink"
              : "text-ink-ghost",
            isToday && "text-daylily-deep"
          )}
        >
          {number}
        </span>
        {look === "written" && entry ? (
          <span className="truncate font-display text-base text-ink leading-4.75">
            {entry.title}
          </span>
        ) : null}
        {look === "resting" ? (
          <span className="text-ink-faint text-xs">Resting</span>
        ) : null}
      </div>
    </DayLink>
  );
}
