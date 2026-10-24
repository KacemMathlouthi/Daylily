import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { Lock, Rss } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/site/button-link";
import { Footer } from "@/components/site/footer";
import { GithubMark } from "@/components/site/github-mark";
import { HeaderSpacer } from "@/components/site/header-spacer";
import { GITHUB_URL, SUGGEST_URL } from "@/components/site/links";
import { Reveal } from "@/components/site/motion";
import { pageMetadata } from "@/lib/site";
import { RELEASES, type Release } from "./releases";

export const metadata: Metadata = {
  ...pageMetadata({
    description:
      "Every release of Daylily, newest first: what grew, what was mended, and what's being written next.",
    path: "/changelog",
    title: "Changelog · Daylily",
  }),
  alternates: {
    canonical: "/changelog",
    types: { "application/rss+xml": "/changelog/rss.xml" },
  },
};

const RELEASES_URL = `${GITHUB_URL}/releases`;

/** A release's day, read the same everywhere: the dates are calendar days, not moments. */
function day(date: string, options: Intl.DateTimeFormatOptions) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    ...options,
    timeZone: "UTC",
  });
}

function Masthead() {
  return (
    <Reveal className="flex flex-col items-center gap-5.5 px-5 pt-16 pb-18 text-center md:pt-22">
      <p className="font-medium text-daylily text-ui">Changelog</p>
      <h1 className="font-display text-fluid-page text-ink leading-display tracking-display">
        What grew lately.
      </h1>
      <p className="max-w-140 text-body text-ink-muted leading-7 md:text-lead">
        Every release of Daylily, newest first. Each one is a page, sealed the
        day it ships, and every page grows a flower.
      </p>
      <div className="flex items-center gap-4.5 pt-1.5">
        <Link
          className="flex items-center gap-1.75 font-medium text-ink-soft text-sm hover:text-ink"
          href="/changelog/rss.xml"
        >
          <Rss
            aria-hidden="true"
            className="text-daylily-deep"
            size={14}
            strokeWidth={2.2}
          />
          Follow by RSS
        </Link>
        <span
          aria-hidden="true"
          className="size-0.75 rounded-full bg-ink-ghost"
        />
        <Link
          className="flex items-center gap-1.75 font-medium text-ink-soft text-sm hover:text-ink"
          href={RELEASES_URL}
        >
          <GithubMark />
          Releases on GitHub
        </Link>
      </div>
    </Reveal>
  );
}

/** The left column: when, and which version. It stays in view while the release scrolls past. */
function DateColumn({ release }: { release: Release }) {
  return (
    <div className="flex flex-col gap-1.5 pt-0.5 lg:sticky lg:top-28 lg:w-65 lg:shrink-0 lg:self-start">
      <p className="font-display text-ink text-title-sm leading-8.5 tracking-snug">
        {day(release.date, { day: "numeric", month: "long" })}
      </p>
      <p className="text-ink-subtle text-ui">
        {day(release.date, { weekday: "long" })} ·{" "}
        {day(release.date, { year: "numeric" })}
      </p>
      <div className="flex pt-2">
        <span className="flex h-6.5 items-center gap-1.5 rounded-full border border-line-strong bg-paper-tint px-2.5 font-mono text-ink-muted text-xs">
          <Lock
            aria-hidden="true"
            className="text-daylily-deep"
            size={10}
            strokeWidth={2.6}
          />
          v{release.version}
        </span>
      </div>
      {release.label ? (
        <p className="pt-1 font-medium text-daylily-deep text-ui">
          {release.label}
        </p>
      ) : null}
    </div>
  );
}

function ReleaseEntry({ release }: { release: Release }) {
  return (
    <Reveal
      className="flex scroll-mt-28 flex-col gap-6 lg:flex-row lg:gap-0"
      id={`v${release.version}`}
    >
      <DateColumn release={release} />
      <div
        aria-hidden="true"
        className="hidden w-16 shrink-0 flex-col items-center lg:flex"
      >
        <DaylilyMark className="shrink-0 text-daylily" size={36} />
        <div className="mt-2.5 w-px grow bg-stem-fade" />
      </div>
      <article className="flex min-w-0 flex-col gap-5.5 pb-24 lg:w-170">
        <h2 className="font-display text-display-sm text-ink leading-heading tracking-heading md:text-display">
          {release.title}
        </h2>
        <p className="font-writing text-ink-soft text-lead leading-8">
          {release.lead}
        </p>
        {release.art ? (
          <div className="relative mt-1.5 h-50 overflow-hidden rounded-2xl shadow-card-lift md:h-65">
            <Image
              alt=""
              className="object-cover object-[50%_60%]"
              fill
              sizes="(min-width: 1024px) 680px, 100vw"
              src={release.art}
            />
          </div>
        ) : null}
        <div className="flex flex-col gap-4.5 pt-3">
          <p className="font-mono text-ink-faint text-tag tracking-caps">
            NEW · {release.changes.length}
          </p>
          <ul className="grid gap-x-10 gap-y-6.5 md:grid-cols-2">
            {release.changes.map((change) => (
              <li className="flex gap-3" key={change.title}>
                <DaylilyMark
                  className={`mt-1.25 shrink-0 ${change.color}`}
                  size={13}
                />
                <div className="flex flex-col gap-0.75">
                  <h3 className="font-display text-ink text-title-2xs leading-6">
                    {change.title}
                  </h3>
                  <p className="text-body-sm text-ink-muted leading-5.75">
                    {change.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-center gap-5 pt-2.5">
          <ButtonLink href="/download" size="pill-md" variant="ink">
            Download {release.version}
          </ButtonLink>
          <Link
            className="font-medium text-ink-soft text-sm hover:text-ink"
            href={`${RELEASES_URL}/tag/v${release.version}`}
          >
            Installers and checksums on GitHub →
          </Link>
        </div>
      </article>
    </Reveal>
  );
}

/** What's coming, as a page still being written: dashed, unsealed, with the ghost prompt waiting. */
function BeingWritten() {
  return (
    <Reveal className="flex flex-col gap-6 pb-22 lg:flex-row lg:gap-0">
      <div className="flex flex-col gap-1.5 pt-0.5 lg:w-65 lg:shrink-0">
        <p className="font-mono text-ink-faint text-xs tracking-eyebrow">
          NEXT
        </p>
        <p className="font-display text-ink-faint text-title-sm leading-8.5 tracking-snug">
          Being written
        </p>
        <p className="text-ink-faint text-ui">Out when it’s ready</p>
      </div>
      <div
        aria-hidden="true"
        className="hidden w-16 shrink-0 flex-col items-center lg:flex"
      >
        <div className="mt-1.5 size-5.5 shrink-0 rounded-full border-[1.5px] border-flower-pale border-dashed" />
        <div className="mt-2 w-0 grow border-line-strong border-l-[1.5px] border-dashed" />
      </div>
      <div className="flex flex-col gap-3.5 rounded-panel border-[1.5px] border-line-strong border-dashed bg-paper-page/60 px-6 py-7.5 md:px-8.5 lg:w-170">
        <p className="flex items-center gap-0.75 font-writing text-2xl text-ghost italic leading-8">
          …what should we grow next?
          <span
            aria-hidden="true"
            className="h-6.5 w-0.5 shrink-0 rounded-full bg-daylily"
          />
        </p>
        <p className="max-w-130 text-body-sm text-ink-muted leading-6">
          Updates that install themselves, search across every day, and a
          welcome for your first run are growing now. They’ll land here when
          they bloom.
        </p>
        <div className="flex flex-wrap gap-6">
          <Link
            className="font-medium text-daylily-deep text-sm hover:underline"
            href="/roadmap"
          >
            See the roadmap →
          </Link>
          <Link
            className="font-medium text-daylily-deep text-sm hover:underline"
            href={SUGGEST_URL}
          >
            Suggest a change →
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

export default function ChangelogPage() {
  return (
    <>
      <main className="bg-dawn-glow bg-paper-raised bg-no-repeat">
        <HeaderSpacer />
        <Masthead />
        <div className="mx-auto max-w-251 px-5 pb-10 lg:px-0">
          <BeingWritten />
          {RELEASES.map((release) => (
            <ReleaseEntry key={release.version} release={release} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
