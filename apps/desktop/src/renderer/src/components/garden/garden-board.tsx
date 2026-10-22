import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { Garden } from "@daylily/ui/components/garden";
import { cn } from "@daylily/ui/lib/cn";
import {
  type CSSProperties,
  type ReactElement,
  type Ref,
  useCallback,
} from "react";
import type { GardenGrid } from "../../lib/garden";
import type { MockDay } from "../../mock/journal";
import { DayPeek } from "./day-peek";

const MONTH_SHORT = new Intl.DateTimeFormat("en", { month: "short" });
/** The largest flower cell: a year fits at 22px; a season's few weeks grow bigger. */
const YEAR_CELL = 22;
const SEASON_CELL = 32;
const SEASON_WEEKS = 16;
/** However long the garden, it finishes blooming in about this long. */
const BLOOM_SPREAD_MS = 1400;

/**
 * Paper's year card: month names over a week-per-column garden, a legend, and a
 * peek at each written day on hover.
 */
export function GardenBoard({
  grid,
  days,
  currentMonth,
  ref,
}: {
  grid: GardenGrid;
  days: ReadonlyMap<string, MockDay>;
  currentMonth: string;
  ref?: Ref<HTMLElement>;
}) {
  const cellSize = grid.columns <= SEASON_WEEKS ? SEASON_CELL : YEAR_CELL;
  const columns = {
    gridTemplateColumns: `repeat(${grid.columns}, minmax(0, ${cellSize}px))`,
  } as CSSProperties;

  const renderDay = useCallback(
    (index: number, cell: ReactElement) => {
      const key = grid.keys[index];
      const day = key ? days.get(key) : undefined;
      return key && day ? (
        <DayPeek cell={cell} day={day} dayKey={key} key={index} />
      ) : (
        cell
      );
    },
    [grid.keys, days]
  );

  return (
    <section
      className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-page/90 px-6 pt-5.5 pb-5 shadow-card"
      ref={ref}
    >
      <div className="grid justify-center" style={columns}>
        {grid.months.map(({ column, date }) => {
          const label = MONTH_SHORT.format(date);
          return (
            <span
              className={cn(
                "whitespace-nowrap text-meta leading-3.5",
                label === currentMonth
                  ? "font-semibold text-ink"
                  : "text-ink-faint"
              )}
              key={`${date.getFullYear()}-${date.getMonth()}`}
              style={{ gridColumnStart: column + 1 }}
            >
              {label}
            </span>
          );
        })}
      </div>
      <Garden
        days={grid.cells}
        maxCell={cellSize}
        renderDay={renderDay}
        staggerMs={Math.min(35, BLOOM_SPREAD_MS / grid.columns)}
        todayIndex={grid.todayIndex}
      />
      <div className="flex items-center gap-4.5 pt-1.5 text-ink-muted text-xs">
        <span className="flex items-center gap-1.5">
          <DaylilyMark className="text-daylily" size={12} />A day you wrote ·
          size follows length
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-soil" />
          Bare soil · resting
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border-[1.5px] border-daylily" />
          Today
        </span>
      </div>
    </section>
  );
}
