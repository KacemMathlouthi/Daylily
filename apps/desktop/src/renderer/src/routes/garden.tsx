import { Button } from "@daylily/ui/primitives/button";
import { createFileRoute } from "@tanstack/react-router";
import { Share } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import meadow from "../assets/meadow.jpg";
import { OUTLINED } from "../components/controls";
import { hourSpan } from "../components/garden/format";
import { GardenBoard } from "../components/garden/garden-board";
import { YearList } from "../components/garden/year-list";
import { Page } from "../components/page";
import { dateFormat } from "../lib/format";
import { gardenGrid, gardenStats, gardenYears } from "../lib/garden";
import { useToday } from "../lib/use-today";
import { MOCK_DAYS } from "../mock/journal";

export const Route = createFileRoute("/garden")({
  component: GardenScreen,
});

const MONTH = dateFormat({ month: "long" });
const NUMBER = new Intl.NumberFormat("en");

/** Paper's "06 Garden": every written day a flower, bare soil for days that rested. */
function GardenScreen() {
  const today = useToday();
  const years = useMemo(() => gardenYears(MOCK_DAYS.keys(), today), [today]);
  const [year, setYear] = useState(() => Number(today.slice(0, 4)));
  const board = useRef<HTMLElement>(null);

  const { grid, stats } = useMemo(() => {
    const built = gardenGrid(
      new Date(year, 0, 1),
      new Date(year, 11, 31),
      today,
      MOCK_DAYS
    );
    return { grid: built, stats: gardenStats(built, MOCK_DAYS) };
  }, [year, today]);

  const saveImage = useCallback(() => {
    const rect = board.current?.getBoundingClientRect();
    if (rect) {
      window.daylily.garden.saveImage(
        { height: rect.height, width: rect.width, x: rect.left, y: rect.top },
        `Daylily garden ${year}`
      );
    }
  }, [year]);

  const tiles = [
    {
      label:
        year === Number(today.slice(0, 4))
          ? "flowers this year"
          : `flowers in ${year}`,
      value: NUMBER.format(stats.flowers),
    },
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
            <span className="text-ink-faint">{year}</span>
          </h1>
          <p className="text-ink-subtle text-ui">
            Every flower is a day you wrote. Bare soil is a day you rested.
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      <div className="flex items-start gap-4">
        <GardenBoard
          currentMonth={today.slice(0, 7)}
          days={MOCK_DAYS}
          grid={grid}
          ref={board}
        />
        <YearList onSelect={setYear} selected={year} years={years} />
      </div>

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
