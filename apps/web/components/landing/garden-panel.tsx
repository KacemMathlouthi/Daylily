"use client";

import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { Garden } from "@daylily/ui/components/garden";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@daylily/ui/primitives/toggle-group";
import { motion, useInView } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
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
      className="absolute -top-14.5 -right-13.5 hidden items-center gap-3 rounded-xl bg-ink py-3 pr-4.5 pl-3 shadow-toast lg:flex"
      initial="hidden"
      transition={{ damping: 16, delay: 1.6, stiffness: 140, type: "spring" }}
      variants={{
        hidden: { opacity: 0, rotate: -6, y: 16 },
        shown: { opacity: 1, rotate: 2, y: 0 },
      }}
    >
      <span className="flex size-8.5 items-center justify-center rounded-lg bg-ink-2">
        <DaylilyMark className="text-saffron" size={18} />
      </span>
      <span className="flex flex-col gap-px">
        <span className="font-semibold text-on-ink text-ui">Welcome back.</span>
        <span className="text-on-ink-muted text-xs">
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

  // A season of weeks is too dense to read on a phone, so small screens open on a month
  useEffect(() => {
    if (window.matchMedia("(max-width: 640px)").matches) {
      setView("month");
    }
  }, []);
  const maxCell = VIEWS.find((option) => option.id === view)?.maxCell;

  // A toggle group can be emptied by clicking the current item; keep one view selected
  const selectView = useCallback((values: string[]) => {
    const next = VIEWS.find((option) => option.id === values[0]);
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
      className="relative flex w-full max-w-275 flex-col gap-7 rounded-panel border border-white/90 bg-paper-page/80 px-5 pt-7 pb-8 shadow-panel-glass backdrop-blur-xl md:px-9"
      ref={ref}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display text-3xl text-ink">Your garden</h3>
          <span className="text-ink-subtle text-ui">{garden.range}</span>
        </div>
        <ToggleGroup
          aria-label="Garden range"
          className="rounded-tile bg-paper-tint p-0.75"
          onValueChange={selectView}
          spacing={0}
          value={[view]}
        >
          {VIEWS.map((option) => (
            <ToggleGroupItem
              className="h-auto rounded-row! border-0 px-3 py-1.25 font-medium text-caption text-ink-subtle hover:bg-transparent hover:text-ink data-pressed:bg-paper-page data-pressed:text-ink data-pressed:shadow-hairline"
              key={option.id}
              value={option.id}
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
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

      <dl className="grid grid-cols-2 gap-y-5 border-line border-t pt-5 md:grid-cols-4">
        {stats.map((stat) => (
          <div className="flex flex-col-reverse gap-0.5" key={stat.label}>
            <dt className="text-ink-subtle text-ui">{stat.label}</dt>
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
