import { cn } from "@daylily/ui/lib/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/site/motion";
import { type Day, TODAY, WEEKDAYS, WEEKS } from "./calendar-days";
import { CalendarWeek } from "./calendar-week";

function DayCell({ day, index }: { day: Day; index: number }) {
  const isToday = day.date === TODAY;

  return (
    <Reveal className="flex flex-col gap-2" delay={index * 0.03} y={16}>
      {"cover" in day ? (
        <div
          className={cn(
            "group relative h-27 overflow-clip rounded-tile",
            isToday &&
              "ring-[1.5px] ring-daylily ring-offset-2 ring-offset-paper-page"
          )}
        >
          <Image
            alt={day.alt}
            className="object-cover transition-transform duration-700 ease-soft group-hover:scale-105"
            fill
            sizes="168px"
            src={`/images/covers/${day.cover}.jpg`}
          />
        </div>
      ) : (
        <div
          className={cn(
            "flex h-27 items-center justify-center rounded-tile",
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
      <div className="flex items-baseline gap-1.75">
        <span
          className={cn(
            "font-semibold text-xs",
            "future" in day ? "text-ink-ghost" : "text-ink",
            isToday && "text-daylily-deep"
          )}
        >
          {day.date}
        </span>
        {"title" in day ? (
          <span className="truncate font-display text-body text-ink leading-5">
            {day.title}
          </span>
        ) : null}
        {"resting" in day ? (
          <span className="text-caption text-ink-faint">Resting</span>
        ) : null}
      </div>
    </Reveal>
  );
}

export function Calendar() {
  return (
    <section
      className="flex flex-col items-center bg-paper-raised px-4 py-28 md:px-16 md:py-42.5"
      id="calendar"
    >
      <div className="flex w-full max-w-328 flex-col gap-14">
        <Reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-4">
            <p className="font-medium text-daylily text-ui">The calendar</p>
            <h2 className="font-display text-5xl text-ink leading-none tracking-display md:text-display-xl">
              A photo album
              <br />
              of your life.
            </h2>
          </div>
          <p className="max-w-110 text-body text-ink-muted leading-7.25 md:text-lg">
            Each day keeps a title and one cover, painted from its words only
            when you ask, or a photo of your own. Scroll back and remember how
            it looked.
          </p>
        </Reveal>

        <Reveal className="lg:hidden">
          <CalendarWeek />
        </Reveal>

        <div className="hidden overflow-x-auto rounded-panel border border-line bg-paper-page shadow-panel lg:block">
          <div className="flex min-w-232 flex-col gap-3.5 px-7 pt-6 pb-7">
            <div className="flex items-center justify-between pb-1.5">
              <h3 className="flex items-baseline gap-2.5 font-display text-3xl">
                <span className="text-ink">October</span>
                <span className="text-on-ink-muted">2026</span>
              </h3>
              <div
                aria-hidden="true"
                className="flex items-center gap-1.5 text-ink-muted"
              >
                <span className="flex size-7.5 items-center justify-center rounded-lg border border-line">
                  <ChevronLeft size={14} strokeWidth={2} />
                </span>
                <span className="flex h-7.5 items-center rounded-lg border border-line px-3 font-medium text-caption text-ink">
                  Today
                </span>
                <span className="flex size-7.5 items-center justify-center rounded-lg border border-line">
                  <ChevronRight size={14} strokeWidth={2} />
                </span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-x-3">
              {WEEKDAYS.map((weekday) => (
                <span
                  className="font-semibold text-ink-faint text-meta uppercase tracking-caps"
                  key={weekday}
                >
                  {weekday}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-x-3 gap-y-6">
              {WEEKS.flat().map((day, index) => (
                <DayCell day={day} index={index} key={day.date} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
