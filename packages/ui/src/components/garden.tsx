import type { CSSProperties, ReactElement, ReactNode } from "react";
import { cn } from "../lib/cn";
import { DaylilyMark } from "./daylily-mark";

export type FlowerColor = "daylily" | "petal" | "saffron" | "cornflower";

/**
 * A written day becomes a flower; a missed day is `null`, bare soil. "upcoming" is a
 * day still ahead (a faint dot) and "blank" pads the grid before the first day.
 */
export type GardenDay = Flower | null | "upcoming" | "blank";

export interface Flower {
  color: FlowerColor;
  words: number;
}

export function isFlower(day: GardenDay): day is Flower {
  return typeof day === "object" && day !== null;
}

const COLOR_CLASS: Record<FlowerColor, string> = {
  cornflower: "text-cornflower",
  daylily: "text-daylily",
  petal: "text-petal",
  saffron: "text-saffron",
};

/** Longer days grow bigger blooms: the share of its cell a flower fills. */
export function bloomScale(words: number) {
  if (words < 150) {
    return 0.62;
  }
  if (words < 400) {
    return 0.76;
  }
  if (words < 700) {
    return 0.88;
  }
  return 0.98;
}

interface GardenProps {
  /** Plays the bloom animation; flowers stay hidden until it is true. */
  blooming?: boolean;
  className?: string;
  days: GardenDay[];
  /** Largest cell size in pixels; cells shrink to fit narrower containers. */
  maxCell?: number;
  /**
   * Wraps a written day's cell, for a hover preview or a link. Days that aren't
   * written are never passed.
   */
  renderDay?: (index: number, cell: ReactElement) => ReactNode;
  /** Days per column; 7 lays the garden out in weeks. */
  rows?: number;
  /** Delay between columns as the garden blooms in, in ms. */
  staggerMs?: number;
  /** Rings today's cell, when today is in view. */
  todayIndex?: number | undefined;
}

export function Garden({
  days,
  rows = 7,
  maxCell = 40,
  blooming = true,
  className,
  renderDay,
  staggerMs = 35,
  todayIndex,
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
          animationDelay: `${column * staggerMs + row * 18}ms`,
        };
        const grow = blooming ? "motion-safe:animate-bloom" : "scale-0";
        const cell = (
          <div
            className={cn(
              "flex aspect-square items-center justify-center",
              index === todayIndex &&
                "rounded-full ring-[1.5px] ring-daylily ring-inset"
            )}
            // biome-ignore lint/suspicious/noArrayIndexKey: days are positional and never reorder
            key={index}
          >
            {isFlower(day) ? (
              <DaylilyMark
                className={cn(COLOR_CLASS[day.color], grow)}
                style={{
                  ...delay,
                  height: "auto",
                  width: `${bloomScale(day.words) * 100}%`,
                }}
              />
            ) : null}
            {day === null ? (
              <span
                className={cn(
                  "aspect-square w-[18%] rounded-full bg-soil",
                  grow
                )}
                style={delay}
              />
            ) : null}
            {day === "upcoming" ? (
              <span className="aspect-square w-[14%] rounded-full bg-line-strong" />
            ) : null}
          </div>
        );
        return isFlower(day) && renderDay ? renderDay(index, cell) : cell;
      })}
    </div>
  );
}
