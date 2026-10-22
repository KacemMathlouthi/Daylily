import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import { DaylilyMark } from "./daylily-mark";

export type FlowerColor = "daylily" | "petal" | "saffron" | "cornflower";

/** A written day becomes a flower; a missed day is `null`, bare soil. */
export type GardenDay = { words: number; color: FlowerColor } | null;

const COLOR_CLASS: Record<FlowerColor, string> = {
  cornflower: "text-cornflower",
  daylily: "text-daylily",
  petal: "text-petal",
  saffron: "text-saffron",
};

/** Longer days grow bigger blooms, as a share of the cell. */
function bloomSize(words: number) {
  if (words < 150) {
    return "62%";
  }
  if (words < 400) {
    return "76%";
  }
  if (words < 700) {
    return "88%";
  }
  return "98%";
}

interface GardenProps {
  /** Plays the bloom animation; flowers stay hidden until it is true. */
  blooming?: boolean;
  className?: string;
  days: GardenDay[];
  /** Largest cell size in pixels; cells shrink to fit narrower containers. */
  maxCell?: number;
  /** Days per column; 7 lays the garden out in weeks. */
  rows?: number;
}

export function Garden({
  days,
  rows = 7,
  maxCell = 40,
  blooming = true,
  className,
}: GardenProps) {
  const columns = Math.ceil(days.length / rows);

  return (
    <div
      className={cn("grid grid-flow-col justify-center", className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, ${maxCell}px))`,
        gridTemplateRows: `repeat(${rows}, auto)`,
      }}
    >
      {days.map((day, index) => {
        const column = Math.floor(index / rows);
        const row = index % rows;
        const delay: CSSProperties = {
          animationDelay: `${column * 35 + row * 18}ms`,
        };
        return (
          <div
            className="flex aspect-square items-center justify-center"
            // biome-ignore lint/suspicious/noArrayIndexKey: days are positional and never reorder
            key={index}
          >
            {day ? (
              <DaylilyMark
                className={cn(
                  COLOR_CLASS[day.color],
                  blooming ? "motion-safe:animate-bloom" : "scale-0"
                )}
                style={{
                  ...delay,
                  height: "auto",
                  width: bloomSize(day.words),
                }}
              />
            ) : (
              <span
                className={cn(
                  "aspect-square w-[18%] rounded-full bg-soil",
                  blooming ? "motion-safe:animate-bloom" : "scale-0"
                )}
                style={delay}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
