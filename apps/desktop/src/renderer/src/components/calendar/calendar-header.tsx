import { Button } from "@daylily/ui/primitives/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dateFormat } from "../../lib/format";
import { OUTLINED } from "../controls";

const MONTH_NAME = dateFormat({ month: "long" });
const NUMBER = new Intl.NumberFormat("en");

export interface MonthStats {
  resting: number;
  words: number;
  written: number;
}

function plural(count: number, one: string, many: string) {
  return `${NUMBER.format(count)} ${count === 1 ? one : many}`;
}

/** The month title, its tally, and the arrows to move between months (Paper: "05"). */
export function CalendarHeader({
  year,
  month,
  stats,
  onPrevious,
  onNext,
}: {
  year: number;
  month: number;
  stats: MonthStats;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <header className="flex items-center justify-between gap-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="flex items-baseline gap-2.5 font-display text-display-xs leading-11 tracking-heading-sm">
          <span className="text-ink">
            {MONTH_NAME.format(new Date(year, month, 1))}
          </span>
          <span className="text-ink-faint">{year}</span>
        </h1>
        <p className="text-ink-subtle text-ui">
          {plural(stats.written, "day written", "days written")} ·{" "}
          {stats.resting} resting · {plural(stats.words, "word", "words")}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          aria-label="Previous month"
          className={`${OUTLINED} w-7.5`}
          onClick={onPrevious}
          size="icon"
          variant="ghost"
        >
          <ChevronLeft className="size-3.5" strokeWidth={2} />
        </Button>
        <Button
          aria-label="Next month"
          className={`${OUTLINED} w-7.5`}
          onClick={onNext}
          size="icon"
          variant="ghost"
        >
          <ChevronRight className="size-3.5" strokeWidth={2} />
        </Button>
      </div>
    </header>
  );
}
