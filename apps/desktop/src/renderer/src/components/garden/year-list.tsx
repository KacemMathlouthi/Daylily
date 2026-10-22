import { cn } from "@daylily/ui/lib/cn";
import { useCallback } from "react";

function YearButton({
  year,
  selected,
  onSelect,
}: {
  year: number;
  selected: boolean;
  onSelect: (year: number) => void;
}) {
  const select = useCallback(() => onSelect(year), [onSelect, year]);
  return (
    <button
      aria-pressed={selected}
      className={cn(
        "flex h-7.5 items-center rounded-row px-3 text-left text-ui transition-colors duration-150",
        selected
          ? "bg-paper-press font-semibold text-ink"
          : "font-medium text-ink-subtle hover:bg-paper-tint hover:text-ink"
      )}
      onClick={select}
      type="button"
    >
      {year}
    </button>
  );
}

/** The years you wrote in, beside the garden, as on a GitHub profile (Paper: "06"). */
export function YearList({
  years,
  selected,
  onSelect,
}: {
  years: number[];
  selected: number;
  onSelect: (year: number) => void;
}) {
  return (
    <nav
      aria-label="Garden year"
      className="flex w-18 shrink-0 flex-col gap-0.5"
    >
      {years.map((year) => (
        <YearButton
          key={year}
          onSelect={onSelect}
          selected={year === selected}
          year={year}
        />
      ))}
    </nav>
  );
}
