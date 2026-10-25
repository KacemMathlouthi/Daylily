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
    changes: [
      {
        body: "Today’s page could stop opening when an image was the last thing on it. It opens again, with everything you wrote.",
        color: "text-daylily",
        title: "Pages that end with a picture",
      },
      {
        body: "An image from the web on your page is shown as its card from the very start, without Daylily ever reaching for it.",
        color: "text-cornflower",
        title: "Quieter still",
      },
    ],
    date: "2026-10-25",
    lead: "A quick fix for pages that end with a picture.",
    title: "Back to the page.",
    version: "0.5.1",
  },
  {
    art: "/images/covers/bike.jpg",
    changes: [
      {
        body: "Paste a picture, or drag one onto today’s page. A line shows where it will land, between your paragraphs.",
        color: "text-daylily",
        title: "Paste or drop",
      },
      {
        body: "Each one is copied, untouched, into the day’s folder under the next number, image-01.jpg, image-02.png and on, and the page links to it in plain markdown any editor can read.",
        color: "text-saffron",
        title: "Kept beside your words",
      },
      {
        body: "An image whose file is gone, or one from the web, shows as a small card instead. Daylily never loads images from the web.",
        color: "text-cornflower",
        title: "Quiet when it can’t show",
      },
      {
        body: "An image added to today’s page in another editor stays put when Daylily saves.",
        color: "text-petal",
        title: "Images from elsewhere, kept",
      },
    ],
    date: "2026-10-25",
    lead: "Today’s page can hold pictures now. They live in the day’s folder beside the page, so the day stays yours and readable anywhere.",
    title: "Pictures on the page.",
    version: "0.5.0",
  },
  {
    changes: [
      {
        body: "⌘K, or Ctrl K, from anywhere: every page you’ve written, searched by its title and its words, on your computer and nowhere else.",
        color: "text-daylily",
        title: "Search your days",
      },
      {
        body: "Results come as you type, and the chosen day shows beside them with the words marked. ⌘J, or Ctrl J, puts the preview away.",
        color: "text-saffron",
        title: "A look before you open",
      },
      {
        body: "Open a day and it scrolls to the words you were looking for, which glow for a moment and fade.",
        color: "text-cornflower",
        title: "Opened at the words",
      },
      {
        body: "“Cafe” finds “café”, “walk” finds “walked”, and a small typo in a longer word is forgiven.",
        color: "text-petal",
        title: "Finds what you meant",
      },
    ],
    date: "2026-10-25",
    lead: "Every page you’ve written, a keystroke away. Search runs on your computer, from your own files, and nothing you type leaves it.",
    title: "Find it again.",
    version: "0.4.0",
  },
  {
    changes: [
      {
        body: "The meadow behind “Save as image” is painted at twice the size, so the card stays crisp wherever you share it.",
        color: "text-saffron",
        title: "A sharper share card",
      },
    ],
    date: "2026-10-25",
    lead: "A small one: the garden’s share card gets a sharper meadow.",
    title: "A clearer meadow.",
    version: "0.3.1",
  },
  {
    art: "/images/covers/stars.jpg",
    changes: [
      {
        body: "Eight new covers: the sea, mountains, a forest, a garden, a full moon, the Milky Way, a telescope under shooting stars and a rocket launch far away.",
        color: "text-cornflower",
        title: "Twenty covers",
      },
      {
        body: "Every gallery cover painted again, large and wide, so a day’s cover stays sharp and keeps its subject in view.",
        color: "text-saffron",
        title: "Sharper covers",
      },
      {
        body: "The cover picker shows four rows and scrolls to the rest.",
        color: "text-petal",
        title: "Room to choose",
      },
    ],
    date: "2026-10-25",
    lead: "The cover gallery, painted again and grown to twenty, with the sea, the mountains and a few night skies.",
    title: "A fuller gallery.",
    version: "0.3.0",
  },
  {
    changes: [
      {
        body: "Daylily looks for a new version as it opens and every few hours. On Windows and with the AppImage it installs when you quit, or right away with “Restart now”.",
        color: "text-daylily",
        title: "Updates itself",
      },
      {
        body: "A quiet card above Settings says when a new version is ready. “Not now” puts it away until the next one.",
        color: "text-saffron",
        title: "A word when it’s ready",
      },
      {
        body: "On a Mac or with the Debian package, Daylily says a new version is out and links to its download.",
        color: "text-cornflower",
        title: "Everywhere else, a link",
      },
      {
        body: "The top of the sidebar names your journal and its folder, and opens its settings.",
        color: "text-petal",
        title: "Your journal, named",
      },
      {
        body: "Days before you started aren’t counted as rested: the calendar, Home and the garden show them as plain ground.",
        color: "text-daylily",
        title: "A journal’s first day",
      },
      {
        body: "A quit that could hang now finishes, a ghost prompt keeps its “…” with its words, and the garden fits a narrow window.",
        color: "text-saffron",
        title: "Small fixes",
      },
    ],
    date: "2026-10-25",
    lead: "From this version on, Daylily keeps itself up to date. Version 0.1.0 can’t update itself, so download this one once by hand.",
    title: "Keeping up.",
    version: "0.2.0",
  },
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
