import type { FlowerColor } from "@daylily/core/flower";
import { Garden, type GardenDay } from "@daylily/ui/components/garden";
import type { Metadata } from "next";
import Link from "next/link";
import { FEATURES } from "@/app/features/features";
import { ButtonLink } from "@/components/site/button-link";
import { Footer } from "@/components/site/footer";
import { HeaderSpacer } from "@/components/site/header-spacer";
import { Reveal } from "@/components/site/motion";

export const metadata: Metadata = {
  description: "This page was never written. The door is always open.",
  title: "Page not found · Daylily",
};

/**
 * Three weeks of a garden, a column a week, as Paper's "404 · desktop" draws
 * it: a colour and a bloom size for each day, ".." for bare soil.
 */
const PATCH =
  "d1 s0 d0 s0 c1 .. d3 s1 d3 .. d0 c0 s3 d1 d1 d1 s2 s1 d1 s0 s1 s3 .. p3 s3 s1 p1 d2 s2 p2 s0 d3 d2 d3 s0 .. .. p2 d2 s3 d0 c3 p0 d2 p3";
/** This page: the bare day in the middle of the patch. */
const THIS_PAGE = 22;

const COLORS: Record<string, FlowerColor> = {
  c: "cornflower",
  d: "daylily",
  p: "petal",
  s: "saffron",
};
/** A word count for each bloom size, smallest first. */
const WORDS = [100, 300, 500, 800];

const PATCH_DAYS: GardenDay[] = PATCH.split(" ").map(([color = "", size]) => {
  const flower = COLORS[color];
  return flower ? { color: flower, words: WORDS[Number(size)] ?? 0 } : null;
});

/** A missing page, as Daylily treats a missed day: bare soil, never an error. */
export default function NotFound() {
  return (
    <>
      <main className="bg-paper-raised">
        <HeaderSpacer />
        <Reveal className="flex flex-col items-center gap-5.5 px-5 pt-11 pb-22 text-center md:gap-7 md:px-30 md:pt-22 md:pb-30">
          <figure className="flex w-full max-w-135 flex-col items-center gap-2.5 pb-1.5 md:pb-3">
            <Garden
              className="w-full"
              days={PATCH_DAYS}
              maxCell={36}
              rows={3}
              todayIndex={THIS_PAGE}
            />
            <figcaption className="text-caption text-ink-subtle">
              This page: bare soil
            </figcaption>
          </figure>
          <p className="font-medium text-daylily text-ui">
            404 · Page not found
          </p>
          <h1 className="font-display text-fluid-page text-ink leading-display tracking-display-tight">
            This page was
            <br />
            <em>never written.</em>
          </h1>
          <p className="max-w-155 font-writing text-ink-soft text-lead leading-7.5 md:text-lede md:leading-9">
            Like a missed day, it’s only bare soil. Nothing here is lost, and
            the door is always open.
          </p>
          <div className="flex w-full flex-col gap-2.5 pt-1.5 sm:w-auto sm:flex-row sm:gap-3">
            <ButtonLink href="/" size="pill-lg" variant="ink">
              Back to the start
            </ButtonLink>
            <ButtonLink href="/download" size="pill-lg" variant="paper">
              Download Daylily
            </ButtonLink>
          </div>
          <nav
            aria-label="Features"
            className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 pt-2 text-sm md:pt-4.5"
          >
            <span className="text-ink-subtle">Or wander:</span>
            {FEATURES.map(({ name, slug }) => (
              <Link
                className="text-ink underline decoration-ink/20 underline-offset-4 transition-colors duration-200 hover:decoration-ink/60"
                href={`/features/${slug}`}
                key={slug}
              >
                {name}
              </Link>
            ))}
          </nav>
        </Reveal>
      </main>
      <Footer closing={false} />
    </>
  );
}
