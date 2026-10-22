import { Button } from "@daylily/ui/primitives/button";
import { createFileRoute } from "@tanstack/react-router";
import { Share } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import meadow from "../assets/meadow.jpg";
import { OUTLINED, Segmented } from "../components/controls";
import { hourSpan } from "../components/garden/format";
import { GardenBoard } from "../components/garden/garden-board";
import { Page } from "../components/page";
import { dateFormat } from "../lib/format";
import {
  type GardenRange,
  gardenGrid,
  gardenStats,
  rangeDates,
} from "../lib/garden";
import { useToday } from "../lib/use-today";
import { MOCK_DAYS } from "../mock/journal";

export const Route = createFileRoute("/garden")({
  component: GardenScreen,
});

const RANGES = [
  { label: "Season", value: "season" },
  { label: "Year", value: "year" },
  { label: "All time", value: "all" },
] as const;

const FLOWERS_LABEL: Record<GardenRange, string> = {
  all: "flowers in all",
  season: "flowers this season",
  year: "flowers this year",
};

const MONTH = dateFormat({ month: "long" });
const MONTH_SHORT = dateFormat({ month: "short" });
const NUMBER = new Intl.NumberFormat("en");
const FIRST_DAY = [...MOCK_DAYS.keys()].sort()[0] ?? "2025-01-01";

function rangeLabel(range: GardenRange, start: Date, end: Date) {
  if (range === "year") {
    return String(start.getFullYear());
  }
  if (range === "season") {
    return `${MONTH_SHORT.format(start)} – ${MONTH_SHORT.format(end)}`;
  }
  return `since ${MONTH_SHORT.format(start)} ${start.getFullYear()}`;
}

/** Paper's "06 Garden": every written day a flower, bare soil for days that rested. */
function GardenScreen() {
  const today = useToday();
  const [range, setRange] = useState<GardenRange>("year");
  const board = useRef<HTMLElement>(null);

  const { grid, stats, start, end } = useMemo(() => {
    const dates = rangeDates(range, today, FIRST_DAY);
    const built = gardenGrid(dates.start, dates.end, today, MOCK_DAYS);
    return { ...dates, grid: built, stats: gardenStats(built, MOCK_DAYS) };
  }, [range, today]);

  const saveImage = useCallback(() => {
    const rect = board.current?.getBoundingClientRect();
    if (rect) {
      window.daylily.garden.saveImage(
        { height: rect.height, width: rect.width, x: rect.left, y: rect.top },
        `Daylily garden ${today}`
      );
    }
  }, [today]);

  const tiles = [
    { label: FLOWERS_LABEL[range], value: NUMBER.format(stats.flowers) },
    { label: "words, every one yours", value: NUMBER.format(stats.words) },
    {
      label: "your fullest month",
      value: stats.fullestMonth ? MONTH.format(stats.fullestMonth) : "Not yet",
    },
    {
      label: "when you usually write",
      value: stats.usualHour === null ? "Not yet" : hourSpan(stats.usualHour),
    },
  ];

  return (
    <Page
      backdrop={
        <img
          alt=""
          className="mask-[linear-gradient(transparent,rgb(0_0_0/0.7)_45%,black)] pointer-events-none absolute inset-x-0 bottom-0 h-75 w-full object-cover object-bottom"
          height={941}
          src={meadow}
          width={1672}
        />
      }
      className="gap-5.5"
    >
      <header className="flex items-center justify-between gap-6">
        <div className="flex flex-col gap-0.5">
          <h1 className="flex items-baseline gap-2.5 font-display text-display-xs leading-11 tracking-heading-sm">
            <span className="text-ink">Your garden</span>
            <span className="text-ink-faint">
              {rangeLabel(range, start, end)}
            </span>
          </h1>
          <p className="text-ink-subtle text-ui">
            Every flower is a day you wrote. Bare soil is a day you rested.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            label="Garden range"
            onChange={setRange}
            options={RANGES}
            value={range}
          />
          <Button
            className={`${OUTLINED} gap-1.75 px-3 font-medium text-caption text-ink`}
            onClick={saveImage}
            variant="ghost"
          >
            <Share className="size-3.25 text-ink-muted" strokeWidth={2} />
            Save as image
          </Button>
        </div>
      </header>

      <GardenBoard
        currentMonth={today.slice(0, 7)}
        days={MOCK_DAYS}
        grid={grid}
        ref={board}
      />

      <div className="grid grid-cols-4 gap-4">
        {tiles.map((tile) => (
          <div
            className="flex flex-col gap-1 rounded-xl border border-line bg-paper-page/85 px-5 py-4.5"
            key={tile.label}
          >
            <span className="font-display text-ink text-title leading-9.5">
              {tile.value}
            </span>
            <span className="text-caption text-ink-subtle">{tile.label}</span>
          </div>
        ))}
      </div>

      <p className="pt-17.5 pb-40 text-center font-display text-ink-muted text-title-sm italic leading-9">
        Nothing here wilts. Come back whenever you like.
      </p>
    </Page>
  );
}
