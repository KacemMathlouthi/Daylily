"use client";

import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { Garden } from "@daylily/ui/components/garden";
import { cn } from "cn";
import { motion, useInView } from "motion/react";
import { type MouseEvent, useCallback, useRef, useState } from "react";
import { type GardenView, gardenFor } from "./garden-data";

const VIEWS: { id: GardenView; label: string; maxCell: number }[] = [
  { id: "month", label: "Month", maxCell: 56 },
  { id: "season", label: "Season", maxCell: 40 },
  { id: "year", label: "Year", maxCell: 24 },
];

const formatNumber = new Intl.NumberFormat("en");

function WelcomeBack({ show }: { show: boolean }) {
  return (
    <motion.div
      animate={show ? "shown" : "hidden"}
      className="absolute -top-14.5 -right-13.5 hidden items-center gap-3 rounded-[14px] bg-ink py-3 pr-4.5 pl-3 shadow-[0_18px_40px_#241b1547] lg:flex"
      initial="hidden"
      transition={{ damping: 16, delay: 1.6, stiffness: 140, type: "spring" }}
      variants={{
        hidden: { opacity: 0, rotate: -6, y: 16 },
        shown: { opacity: 1, rotate: 2, y: 0 },
      }}
    >
      <span className="flex size-8.5 items-center justify-center rounded-[10px] bg-ink-2">
        <DaylilyMark className="text-saffron" size={18} />
      </span>
      <span className="flex flex-col gap-px">
        <span className="font-semibold text-[13px] text-paper-raised">
          Welcome back.
        </span>
        <span className="text-[#b5a493] text-xs">
          Your garden waited for you.
        </span>
      </span>
    </motion.div>
  );
}

export function GardenPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px", once: true });
  const [view, setView] = useState<GardenView>("season");
  const garden = gardenFor(view);
  const maxCell = VIEWS.find((option) => option.id === view)?.maxCell;

  const selectView = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const next = VIEWS.find(
      (option) => option.id === event.currentTarget.value
    );
    if (next) {
      setView(next.id);
    }
  }, []);

  const stats = [
    { label: "flowers grown", value: garden.flowers },
    { label: "words, all yours", value: garden.words },
    { label: "days resting, and that’s fine", value: garden.resting },
    { label: "streaks to protect", value: 0 },
  ];

  return (
    <div
      className="relative flex w-full max-w-275 flex-col gap-7 rounded-[20px] border border-white/90 bg-paper-page/80 px-5 pt-7 pb-8 shadow-[inset_0_1px_0_#ffffffe6,0_30px_70px_#78461e24] backdrop-blur-xl md:px-9"
      ref={ref}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display text-3xl text-ink">Your garden</h3>
          <span className="text-[13px] text-ink-subtle">{garden.range}</span>
        </div>
        <fieldset className="flex rounded-[9px] bg-[#f1ebe1] p-0.75">
          <legend className="sr-only">Garden range</legend>
          {VIEWS.map((option) => (
            <button
              aria-pressed={view === option.id}
              className={cn(
                "cursor-pointer rounded-[7px] px-3 py-1.25 font-medium text-[12.5px] transition-colors duration-300",
                view === option.id
                  ? "bg-paper-page text-ink shadow-[0_1px_2px_#241b1514]"
                  : "text-ink-subtle hover:text-ink"
              )}
              key={option.id}
              onClick={selectView}
              type="button"
              value={option.id}
            >
              {option.label}
            </button>
          ))}
        </fieldset>
      </div>

      <div className="flex min-h-48 items-center overflow-x-auto md:min-h-69">
        <Garden
          blooming={inView}
          className="w-full"
          days={garden.days}
          key={view}
          {...(maxCell ? { maxCell } : {})}
        />
      </div>

      <dl className="grid grid-cols-2 gap-y-5 border-[#eee6da] border-t pt-5 md:grid-cols-4">
        {stats.map((stat) => (
          <div className="flex flex-col-reverse gap-0.5" key={stat.label}>
            <dt className="text-[13px] text-ink-subtle">{stat.label}</dt>
            <dd className="font-display text-4xl text-ink tabular-nums">
              {formatNumber.format(stat.value)}
            </dd>
          </div>
        ))}
      </dl>

      <WelcomeBack show={inView} />
    </div>
  );
}
