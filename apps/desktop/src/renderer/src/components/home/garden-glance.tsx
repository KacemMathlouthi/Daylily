import { Garden } from "@daylily/ui/components/garden";
import { Link } from "@tanstack/react-router";
import type { GardenGrid } from "../../lib/garden";

const NUMBER = new Intl.NumberFormat("en");

export interface GlanceStats {
  averageWords: number;
  flowers: number;
  since: string;
  /** Of the six days before today, how many the journal has had. */
  weekDays: number;
  /** Days written out of the six before today. */
  weekWritten: number;
}

/** Home's small garden: the last half year of flowers and three gentle numbers. */
export function GardenGlance({
  grid,
  stats,
}: {
  grid: GardenGrid;
  stats: GlanceStats;
}) {
  const numbers = [
    {
      label: `flowers since ${stats.since}`,
      value: NUMBER.format(stats.flowers),
    },
    {
      label: "days this week",
      // A young journal counts only its own days, never ones from before it began
      value:
        stats.weekDays > 0
          ? `${stats.weekWritten} of ${stats.weekDays}`
          : String(stats.weekWritten),
    },
    {
      label: "words on an average day",
      value: NUMBER.format(stats.averageWords),
    },
  ];

  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-paper-sunk px-6 py-5.5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-ink text-title-2xs leading-7">
          Your garden
        </h2>
        <Link
          className="font-medium text-caption text-ink-subtle transition-colors hover:text-ink"
          to="/garden"
        >
          Open garden →
        </Link>
      </div>
      <Garden days={grid.cells} maxCell={18} todayIndex={grid.todayIndex} />
      <div className="flex gap-7">
        {numbers.map((number) => (
          <div className="flex flex-col" key={number.label}>
            <span className="font-display text-ink text-title-xs leading-7.5">
              {number.value}
            </span>
            <span className="text-ink-subtle text-xs">{number.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
