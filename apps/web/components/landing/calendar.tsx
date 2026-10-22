import { cn } from "cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/site/motion";

type Day =
  | { date: number; title: string; cover: string; alt: string }
  | { date: number; resting: true }
  | { date: number; future: true };

const TODAY = 20;

const WEEKS: Day[][] = [
  [
    {
      alt: "Autumn hills through a train window",
      cover: "train",
      date: 5,
      title: "On the train",
    },
    { date: 6, resting: true },
    {
      alt: "A birthday cake with one candle",
      cover: "cake",
      date: 7,
      title: "Mara’s birthday",
    },
    {
      alt: "An open book on a quilt",
      cover: "book",
      date: 8,
      title: "A slow morning",
    },
    {
      alt: "A bicycle with a basket of flowers",
      cover: "bike",
      date: 9,
      title: "Fresh air",
    },
    {
      alt: "A river at sunset",
      cover: "river",
      date: 10,
      title: "By the river",
    },
    {
      alt: "Tea on a sunny windowsill",
      cover: "tea",
      date: 11,
      title: "Slow Sunday",
    },
  ],
  [
    {
      alt: "Soup by a rainy window",
      cover: "rain",
      date: 12,
      title: "Rain and soup",
    },
    {
      alt: "A lit cottage at dusk",
      cover: "cottage",
      date: 13,
      title: "Home again",
    },
    { date: 14, resting: true },
    {
      alt: "Morning light over a meadow",
      cover: "first-light",
      date: 15,
      title: "First light",
    },
    {
      alt: "Daylilies in a jar on a table",
      cover: "flowers",
      date: 16,
      title: "Fresh flowers",
    },
    { date: 17, resting: true },
    {
      alt: "A meadow at dusk",
      cover: "evening",
      date: 18,
      title: "Evening walk",
    },
  ],
  [
    {
      alt: "A bench by a sunny road",
      cover: "bench",
      date: 19,
      title: "On my way",
    },
    {
      alt: "Daylilies along a fence at sunset",
      cover: "long-way-home",
      date: TODAY,
      title: "The long way home",
    },
    { date: 21, future: true },
    { date: 22, future: true },
    { date: 23, future: true },
    { date: 24, future: true },
    { date: 25, future: true },
  ],
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

        <div className="overflow-x-auto rounded-panel border border-line bg-paper-page shadow-panel">
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
