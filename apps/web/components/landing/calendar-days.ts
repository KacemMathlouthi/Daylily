/** The sample month on the landing page: three weeks of October 2026, today the 20th. */
export type Day =
  | { date: number; title: string; cover: string; alt: string }
  | { date: number; resting: true }
  | { date: number; future: true };

export const TODAY = 20;

/** The three weeks of October the landing page shows, Monday first. */
export const WEEKS: Day[][] = [
  [
    {
      alt: "Autumn hills through a train window",
      cover: "train",
      date: 5,
      title: "On the train",
    },
    { date: 6, resting: true },
    {
      alt: "A birthday cake with one candle",
      cover: "cake",
      date: 7,
      title: "Mara’s birthday",
    },
    {
      alt: "The sea from a cliff path",
      cover: "sea",
      date: 8,
      title: "By the sea",
    },
    {
      alt: "A bicycle with a basket of flowers",
      cover: "bike",
      date: 9,
      title: "Fresh air",
    },
    {
      alt: "Mountains above a lake at golden hour",
      cover: "mountains",
      date: 10,
      title: "Up the mountain",
    },
    {
      alt: "The Milky Way above a hillside",
      cover: "stars",
      date: 11,
      title: "Under the stars",
    },
  ],
  [
    {
      alt: "Soup by a rainy window",
      cover: "rain",
      date: 12,
      title: "Rain and soup",
    },
    {
      alt: "A sunlit forest path",
      cover: "forest",
      date: 13,
      title: "A walk in the woods",
    },
    { date: 14, resting: true },
    {
      alt: "A rocket launch far away at dusk",
      cover: "rocket",
      date: 15,
      title: "Launch day",
    },
    {
      alt: "A cottage garden in summer",
      cover: "garden",
      date: 16,
      title: "In the garden",
    },
    { date: 17, resting: true },
    {
      alt: "A full moon rising over the meadow",
      cover: "moon",
      date: 18,
      title: "A full moon",
    },
  ],
  [
    {
      alt: "A telescope under shooting stars",
      cover: "telescope",
      date: 19,
      title: "Shooting stars",
    },
    {
      alt: "Daylilies along a fence at sunset",
      cover: "long-way-home",
      date: TODAY,
      title: "The long way home",
    },
    { date: 21, future: true },
    { date: 22, future: true },
    { date: 23, future: true },
    { date: 24, future: true },
    { date: 25, future: true },
  ],
];

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
