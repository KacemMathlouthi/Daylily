import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "@/components/site/footer";
import { HeaderSpacer } from "@/components/site/header-spacer";
import { SUGGEST_URL } from "@/components/site/links";
import { Reveal } from "@/components/site/motion";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  description:
    "What's growing in Daylily next: richer days, AI that asks but never writes, and your journal everywhere you write.",
  path: "/roadmap",
  title: "Roadmap · Daylily",
});

interface Item {
  body: string;
  title: string;
}

/**
 * The sheet, cell by cell, two to a row on wide screens. Everything here is
 * past v1 (ROADMAP.md, "Later"); what's in v1 lands in the changelog instead.
 */
type Cell =
  | { kind: "section"; name: string; title: ReactNode }
  | { kind: "note" }
  | { kind: "promise" }
  | { kind: "closing" }
  | { kind: "art"; art: "cover" | "garden" | "page" | "terminal" }
  | ({ kind: "item" } & Item);

const CELLS: Cell[] = [
  { kind: "section", name: "richer days", title: "Richer days" },
  { kind: "note" },
  { art: "page", kind: "art" },
  {
    body: "Speak your day and watch it become words, transcribed on your own computer. Keep the recording too, if you like.",
    kind: "item",
    title: "Write with your voice",
  },
  {
    body: "Pin the song that was playing, from Spotify, Apple Music or YouTube. It plays right on the page.",
    kind: "item",
    title: "A song for the day",
  },
  {
    body: "Videos and files beside your words, kept in the day’s folder. A pasted link becomes a small card with its title and picture.",
    kind: "item",
    title: "Video, files and links",
  },
  {
    body: "Diagrams, math, callouts and footnotes, drawn on the page and kept as plain text any editor can read.",
    kind: "item",
    title: "Diagrams and more",
  },
  {
    body: "Your accent colour, your writing font and size, the width of the page. Turn off anything you don’t need.",
    kind: "item",
    title: "Make it yours",
  },
  {
    body: "A year of days as a book you can print and hold, or the whole journal as a zip.",
    kind: "item",
    title: "Export and print",
  },
  {
    body: "Import from Day One, Journey, Obsidian daily notes or a folder of markdown, and keep every day you’ve already written.",
    kind: "item",
    title: "Bring your old journals",
  },
  {
    body: "Words written, favourite covers, the songs, the garden through the seasons. Made on your computer, kind to the days you missed.",
    kind: "item",
    title: "Your year, in review",
  },
  { art: "garden", kind: "art" },
  {
    kind: "section",
    name: "ai",
    title: (
      <>
        AI that asks,
        <br />
        never writes
      </>
    ),
  },
  { kind: "promise" },
  {
    body: "Bring a key from any provider, or run a model on your own computer. Nothing leaves without asking.",
    kind: "item",
    title: "Your model, your choice",
  },
  {
    body: "A week, a month, a year: what went right, what was hard, and the patterns you might have missed.",
    kind: "item",
    title: "Look-backs",
  },
  {
    body: "The moments worth remembering, marked on pages you wrote. Not one of your words changes.",
    kind: "item",
    title: "Highlights",
  },
  {
    body: "A cover painted from what you wrote that day, only when you ask for one.",
    kind: "item",
    title: "Covers from your words",
  },
  {
    body: "Run Claude Code, Codex or any tool on your journal folder, from inside Daylily. Hidden until you want it.",
    kind: "item",
    title: "A terminal for agents",
  },
  { art: "terminal", kind: "art" },
  {
    kind: "section",
    name: "everywhere",
    title: (
      <>
        Everywhere
        <br />
        you write
      </>
    ),
  },
  { art: "cover", kind: "art" },
  {
    body: "Installers your Mac and Windows trust, with no warnings to click through.",
    kind: "item",
    title: "Signed, and up to date",
  },
  {
    body: "Daylily in Homebrew, winget and Flathub, next to the rest of your apps.",
    kind: "item",
    title: "Where you install apps",
  },
  {
    body: "Any synced folder works today. Next: a git commit at every seal, your own bucket, or Google Drive.",
    kind: "item",
    title: "Sync, your way",
  },
  {
    body: "Your journal on every computer with nothing to set up, encrypted end to end. The paid part of Daylily.",
    kind: "item",
    title: "Sync, done for you",
  },
  {
    body: "The same page and the same garden, for the nights you’d rather write lying down.",
    kind: "item",
    title: "On your phone, in bed",
  },
  {
    body: "An optional password on your journal, for computers you share.",
    kind: "item",
    title: "A locked journal",
  },
  {
    body: "Longer pieces, like essays, stories and letters, private until you choose to publish one on its own page.",
    kind: "item",
    title: "Codexes",
  },
  { kind: "closing" },
];

function cellKey(cell: Cell) {
  switch (cell.kind) {
    case "item":
      return cell.title;
    case "art":
      return cell.art;
    case "section":
      return cell.name;
    default:
      return cell.kind;
  }
}

/** The pins where the sheet's lines cross. */
function Pin({ side }: { side: "left" | "right" }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute -top-1 size-1.75 rounded-full bg-flower-pale ${side === "left" ? "-left-1" : "-right-1"}`}
    />
  );
}

/** A sprout: the one stage every item on this page is at. */
function InProgress() {
  return (
    <span className="flex h-6.5 w-fit items-center gap-1.75 rounded-full border border-line-strong bg-paper-page px-2.75 font-mono text-ink-soft text-xs">
      <svg aria-hidden="true" height="12" viewBox="0 0 24 24" width="12">
        <path
          className="stroke-moss"
          d="M12 21v-9"
          fill="none"
          strokeLinecap="round"
          strokeWidth="2.4"
        />
        <path
          className="fill-moss/80"
          d="M12 12c0-4.4-3.2-7-8-7 0 4.4 3.2 7 8 7z"
        />
        <path
          className="fill-moss"
          d="M12 10c0-3.6 2.6-6 6.8-6 0 3.6-2.6 6-6.8 6z"
        />
      </svg>
      in progress
    </span>
  );
}

/** A question the page asks itself, pinned to the sheet like a note. */
function GhostNote({
  className,
  prompt,
  tone,
}: {
  className: string;
  prompt: string;
  tone: "cornflower" | "petal";
}) {
  const dot = tone === "petal" ? "bg-petal" : "bg-cornflower";
  const label = tone === "petal" ? "text-petal" : "text-cornflower";
  return (
    <div
      aria-hidden="true"
      className={`absolute z-10 hidden items-start gap-1.5 lg:flex ${className}`}
    >
      <span className={`size-4 shrink-0 rounded-full shadow-hairline ${dot}`} />
      <div className="mt-3 flex flex-col gap-0.75 rounded-2xl border border-line bg-paper-raised px-4.5 pt-3 pb-3.5 shadow-card-lift">
        <p className={`font-mono text-tag tracking-eyebrow ${label}`}>
          ghost prompt
        </p>
        <p className="flex items-center gap-0.5 font-writing text-body text-ink-subtle italic leading-6">
          {prompt}
          <span className="h-4.5 w-px shrink-0 bg-daylily" />
        </p>
      </div>
    </div>
  );
}

function ArtCell({ art }: { art: "cover" | "garden" | "page" | "terminal" }) {
  if (art === "cover") {
    return (
      <Image
        alt=""
        className="object-cover"
        fill
        sizes="(min-width: 768px) 541px, 100vw"
        src="/images/covers/train.jpg"
      />
    );
  }
  if (art === "garden") {
    return (
      <Image
        alt=""
        className="w-[86%]"
        height={616}
        src="/images/art/garden-graph.png"
        width={2288}
      />
    );
  }
  if (art === "terminal") {
    return (
      <div className="flex w-full max-w-95 rotate-[1.5deg] flex-col gap-2.5 rounded-2xl bg-ink px-5.5 py-5 shadow-card-lift">
        <div className="flex gap-1.5">
          <span className="size-2 rounded-full bg-ink-soft" />
          <span className="size-2 rounded-full bg-ink-soft" />
          <span className="size-2 rounded-full bg-ink-soft" />
        </div>
        <p className="whitespace-pre font-mono text-on-ink-2 text-ui leading-5.5">
          {"~/Daylily $ claude\n> when did I last write about the sea?"}
        </p>
        <p className="whitespace-pre font-mono text-saffron text-ui leading-5.5">
          {"  2026/08/14 · The long way home"}
        </p>
      </div>
    );
  }
  return (
    <div className="flex w-full max-w-100 -rotate-[1.2deg] flex-col gap-2.5 rounded-2xl border border-line bg-paper-page px-7.5 py-6.5 shadow-card-lift">
      <p className="font-medium text-ink-subtle text-tag">Friday, October 23</p>
      <p className="font-display text-ink text-title-xs leading-7">
        The long way home
      </p>
      <p className="font-writing text-base text-ink-2 leading-6.5">
        We took the river path because the light was too good to waste. Mara
        said nothing for a whole mile, and it was the nicest mile.
      </p>
      <p className="flex items-center gap-0.5 font-writing text-base text-ghost italic leading-6.5">
        …and how did you feel about that?
        <span className="h-4.5 w-px shrink-0 bg-daylily" />
      </p>
    </div>
  );
}

function SheetCell({ cell, right }: { cell: Cell; right: boolean }) {
  const frame =
    "relative flex flex-col justify-center border-line-strong border-r border-b px-8 md:px-15";
  const pins = (
    <>
      <Pin side="left" />
      {right ? <Pin side="right" /> : null}
    </>
  );

  switch (cell.kind) {
    case "section":
      return (
        <div className={`${frame} min-h-50 md:min-h-65`}>
          {pins}
          <h2 className="font-display text-display-sm text-ink leading-none tracking-display md:text-display-lg">
            {cell.title}
          </h2>
        </div>
      );
    case "note":
      return (
        <div className={`${frame} min-h-50 gap-3.5 md:min-h-65`}>
          {pins}
          <InProgress />
          <p className="text-base text-ink-muted leading-6.5">
            Everything on this page is growing now. The order can change, and
            you can help change it.
          </p>
        </div>
      );
    case "promise":
      return (
        <div className={`${frame} min-h-50 md:min-h-65`}>
          {pins}
          <GhostNote
            className="-top-7 -right-21.5"
            prompt="…and how did you feel about that?"
            tone="cornflower"
          />
          <p className="font-writing text-ink-2 text-lead leading-7.75">
            Off until you turn it on, one feature at a time, with the model you
            choose. It can ask you questions and look back with you. It will
            never write a word of your journal.
          </p>
        </div>
      );
    case "closing":
      return (
        <div className={`${frame} min-h-75 gap-4 bg-daylily-wash py-12`}>
          {pins}
          <h2 className="font-display text-ink text-title-sm leading-8">
            Already in your garden
          </h2>
          <p className="text-base text-ink-muted leading-6.5">
            Today’s page, ghost prompts, sealing at 4am, plain files, the
            calendar and garden, the evening reminder.
          </p>
          <div className="flex flex-wrap gap-6">
            <Link
              className="font-medium text-daylily-deep text-sm hover:underline"
              href="/changelog"
            >
              Read the changelog →
            </Link>
            <Link
              className="font-medium text-daylily-deep text-sm hover:underline"
              href={SUGGEST_URL}
            >
              Suggest a change →
            </Link>
          </div>
        </div>
      );
    case "art":
      return (
        <div
          className={`relative flex min-h-75 items-center justify-center overflow-clip border-line-strong border-r border-b bg-paper-sunk px-6 ${cell.art === "cover" ? "min-h-65" : "md:min-h-80"}`}
        >
          {pins}
          <ArtCell art={cell.art} />
        </div>
      );
    default:
      return (
        <div className={`${frame} min-h-75 gap-3.5 py-12`}>
          {pins}
          <h3 className="font-display text-ink text-title-sm leading-8">
            {cell.title}
          </h3>
          <p className="text-base text-ink-muted leading-6.5">{cell.body}</p>
          <div className="pt-1.5">
            <InProgress />
          </div>
        </div>
      );
  }
}

function TitleRow() {
  return (
    <>
      <div className="relative flex min-h-90 flex-col justify-between gap-12 border-line-strong border-r border-b px-8 pt-16 pb-13 md:min-h-115 md:px-15">
        <Pin side="left" />
        <h1 className="font-display text-display-lg text-ink leading-none tracking-display-tight md:text-display-xl">
          The Daylily
          <span className="flex items-center gap-3.5">
            <Image
              alt=""
              className="size-13 md:size-17"
              height={256}
              priority
              src="/images/art/mark-textured.png"
              width={256}
            />
            roadmap
          </span>
        </h1>
        <p className="text-body-sm text-ink-muted">
          growing in the open · 2026
        </p>
      </div>
      <div className="relative flex flex-col justify-end border-line-strong border-r border-b px-8 pt-16 pb-13 md:min-h-115 md:px-15">
        <Pin side="left" />
        <Pin side="right" />
        <GhostNote
          className="-top-8.5 left-14"
          prompt="…what would you plant next?"
          tone="petal"
        />
        <p className="font-writing text-ink-2 text-lead leading-7.75">
          Daylily is a journal for your own days, in your own words. This is
          what’s growing next. Everything here is being worked on, roughly in
          this order, and plans change with the seasons.
        </p>
      </div>
    </>
  );
}

export default function RoadmapPage() {
  return (
    <>
      <main className="bg-dawn-glow bg-paper-raised bg-no-repeat">
        <HeaderSpacer />
        <div className="px-4 pt-14 pb-30">
          <Reveal className="mx-auto grid max-w-271 grid-cols-1 border-line-strong border-t border-l bg-paper-page shadow-panel md:grid-cols-2">
            <TitleRow />
            {CELLS.map((cell, index) => (
              <SheetCell
                cell={cell}
                key={cellKey(cell)}
                // Rows of two after the title row: odd cells sit on the right
                right={index % 2 === 1}
              />
            ))}
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
