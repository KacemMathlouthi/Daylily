/**
 * Every release of the desktop app, newest first, written by hand for now.
 * Add one when a release ships; the version and date match its GitHub Release.
 */

interface Change {
  body: string;
  /** The flower's colour beside it, a text colour utility. */
  color: string;
  title: string;
}

export interface Release {
  /** The art at the top of a big release, from `public/images`. */
  art?: string;
  changes: Change[];
  /** The day it shipped, `YYYY-MM-DD`. */
  date: string;
  /** A word under the version, for the releases that deserve one. */
  label?: string;
  lead: string;
  title: string;
  version: string;
}

export const RELEASES: Release[] = [
  {
    art: "/images/art/path.jpg",
    changes: [
      {
        body: "Opens on “How was your day?” with the cursor ready, and saves as you write.",
        color: "text-daylily",
        title: "Today’s page",
      },
      {
        body: "Pause, and a quiet question appears. Never inserted, gone when you type.",
        color: "text-petal",
        title: "Ghost prompts",
      },
      {
        body: "When the day ends its page stays as written, like ink. Coverless days get one from the gallery.",
        color: "text-saffron",
        title: "Days seal at 4am",
      },
      {
        body: "One folder per day, in a folder you choose. Edit anywhere; Daylily notices.",
        color: "text-cornflower",
        title: "Plain markdown files",
      },
      {
        body: "A month of covers, and a year of flowers, one for every day you wrote.",
        color: "text-daylily",
        title: "Calendar and garden",
      },
      {
        body: "“How was your day?” at your time, skipped when you’ve already written.",
        color: "text-petal",
        title: "An evening reminder",
      },
    ],
    date: "2026-10-24",
    label: "The first release",
    lead: "Everything you need to write one page a day, keep it, and watch it grow. Daylily is early: it works, it keeps your words safe, and it will keep changing quickly.",
    title: "The first page.",
    version: "0.1.0",
  },
];
