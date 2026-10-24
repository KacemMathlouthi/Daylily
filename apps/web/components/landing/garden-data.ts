import type { FlowerColor } from "@daylily/core/flower";
import { type GardenDay, isFlower } from "@daylily/ui/components/garden";

const TODAY = new Date(2026, 9, 20);
const DAYS_IN_YEAR_VIEW = 52 * 7;
const REST_CHANCE = 0.13;

const COLORS: [FlowerColor, number][] = [
  ["daylily", 0.34],
  ["petal", 0.3],
  ["saffron", 0.24],
  ["cornflower", 0.12],
];

/** Park–Miller PRNG, seeded so the sample garden is identical on every visit. */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16_807) % 2_147_483_647;
    return (state - 1) / 2_147_483_646;
  };
}

function pickColor(roll: number): FlowerColor {
  let total = 0;
  for (const [color, weight] of COLORS) {
    total += weight;
    if (roll < total) {
      return color;
    }
  }
  return "daylily";
}

const random = seededRandom(2026);
const YEAR: GardenDay[] = Array.from({ length: DAYS_IN_YEAR_VIEW }, () => {
  if (random() < REST_CHANCE) {
    return null;
  }
  return {
    color: pickColor(random()),
    words: Math.round(60 + random() ** 1.6 * 840),
  };
});

export type GardenView = "month" | "season" | "year";

const VIEW_DAYS: Record<GardenView, number> = {
  month: 5 * 7,
  season: 26 * 7,
  year: DAYS_IN_YEAR_VIEW,
};

const formatDate = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
});

export function gardenFor(view: GardenView) {
  const length = VIEW_DAYS[view];
  const days = YEAR.slice(-length);
  const start = new Date(TODAY);
  start.setDate(TODAY.getDate() - length + 1);

  const flowers = days.filter(isFlower);
  return {
    days,
    flowers: flowers.length,
    range: `${formatDate.format(start)} – ${formatDate.format(TODAY)}`,
    resting: days.length - flowers.length,
    words: flowers.reduce((sum, day) => sum + day.words, 0),
  };
}
