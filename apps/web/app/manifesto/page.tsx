import { X } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Footer } from "@/components/site/footer";
import { HeaderSpacer } from "@/components/site/header-spacer";
import { Reveal } from "@/components/site/motion";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  description:
    "Most journals want to write for you. Daylily would rather listen. The six promises behind it.",
  path: "/manifesto",
  title: "Manifesto · Daylily",
});

const BELIEFS = [
  {
    body: "Today is the only page you can write. When the day ends it seals and becomes part of your history, honest and unedited, like ink in a paper journal.",
    title: "One page per day.",
  },
  {
    body: "It opens on “How was your day?”, and when you pause it whispers “…and how did you feel about that?” It asks. It never answers for you.",
    title: "It draws more out of you.",
  },
  {
    body: "Every day you write plants a flower. Over months the garden becomes a picture of your life that you can stroll through.",
    title: "Your days grow into a garden.",
  },
  {
    body: "Days are plain markdown in a folder you own. Open them in any editor, grep them, or read them in twenty years. No lock-in, ever.",
    title: "Your files are yours.",
  },
  {
    body: "AI is off until you turn it on, feature by feature, with whatever model you choose. It can ask, answer and illustrate. Your page stays yours.",
    title: "AI asks. It never writes.",
  },
  {
    body: "No streaks, no wilting, no shaming. A missed day is bare soil, and the door is always open.",
    title: "Welcome back, never guilt.",
  },
];

const NEVER = [
  "Write, rewrite, autocomplete, fix the grammar of, or summarize into your entry.",
  "Count streaks, wilt your plants, or send you guilt.",
  "Lock your journal in a database you can’t read without us.",
  "Turn your days into a feed. What you write is not content.",
  "Reach for neon, confetti or dark patterns to keep you hooked.",
];

function Masthead() {
  return (
    <Reveal className="flex flex-col items-center gap-7 px-5 pt-16 pb-18 text-center md:px-30 md:pt-30">
      <p className="font-medium text-daylily text-ui">Manifesto</p>
      <h1 className="font-display text-fluid-page text-ink leading-display tracking-display-tight">
        Most journals want to write for you.
        <br />
        <em>We would rather listen.</em>
      </h1>
      <p className="text-ink-subtle text-sm">
        Daylily · October 2026 · A four minute read
      </p>
    </Reveal>
  );
}

function Lede() {
  return (
    <Reveal className="mx-auto flex max-w-170 flex-col gap-6 px-5 pb-24 font-writing">
      <p className="text-ink-2 text-lede leading-9 md:text-2xl md:leading-9.5">
        Most journaling apps are trying to write your journal for you, through
        AI summaries, chat-to-entry and auto-titles. Daylily goes the other way.
      </p>
      <p className="text-ink-soft text-lead leading-8 md:text-xl md:leading-8.5">
        Its whole job is to get you to sit down every day and say what happened
        and how it felt, in your own words. Broken grammar, typos and unfinished
        thoughts all count, because they are true.
      </p>
    </Reveal>
  );
}

function Beliefs() {
  return (
    <section className="px-5 pt-24 pb-30 md:px-30 md:pt-30">
      <div className="mx-auto flex max-w-300 flex-col gap-14">
        <Reveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-3.5">
            <p className="font-medium text-daylily text-ui">What we believe</p>
            <h2 className="font-display text-5xl text-ink leading-heading tracking-heading md:text-display-lg">
              Six promises, kept.
            </h2>
          </div>
          <p className="max-w-105 text-body text-ink-muted leading-7">
            Everything in Daylily comes back to these. When a feature would
            break one of them, the feature loses.
          </p>
        </Reveal>
        <ol className="grid gap-x-20 gap-y-14 md:grid-cols-2">
          {BELIEFS.map((belief, index) => (
            <li className="border-line border-t pt-7" key={belief.title}>
              <Reveal className="flex gap-7" delay={(index % 2) * 0.08}>
                <span className="w-14 shrink-0 font-display text-daylily text-display-sm leading-11">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-2.5">
                  <h3 className="font-display text-ink text-title-sm leading-9.5 tracking-title md:text-title">
                    {belief.title}
                  </h3>
                  <p className="text-base text-ink-muted leading-6.5">
                    {belief.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * At full width the words sit in the painting's dark third. Narrower, that side
 * is too small, so the words come first and the painting follows as a card, as in
 * "Why Daylily".
 */
function SeenByYou() {
  return (
    <section className="px-4 md:px-16">
      <Reveal className="wide:relative mx-auto flex wide:aspect-[1312/738] max-w-328 flex-col gap-7 wide:overflow-clip wide:rounded-card-lg">
        <div className="wide:absolute relative wide:inset-0 aspect-square wide:aspect-auto overflow-clip rounded-3xl wide:rounded-none sm:aspect-[3/2] md:rounded-card-lg">
          <Image
            alt="An eye half in shadow, a daylily where the iris would be"
            className="object-cover object-[64%_50%] wide:object-center"
            fill
            sizes="(max-width: 1312px) 100vw, 1312px"
            src="/images/art/eye.jpg"
          />
        </div>
        <div className="relative -order-1 wide:order-none flex max-w-117.5 flex-col gap-4 wide:gap-5 px-2 wide:pt-21 wide:pr-0 wide:pl-20">
          <p className="font-medium text-daylily-deep text-ui wide:text-saffron">
            Your privacy
          </p>
          <h2 className="font-display text-5xl text-ink wide:text-display-lg wide:text-on-ink leading-heading-loose tracking-heading">
            For your eyes only.
          </h2>
          <p className="font-writing text-ink-2 text-lead wide:text-on-ink-2 wide:text-xl leading-7.75 wide:leading-8.25">
            Your days live on your computer, as plain files in a folder you
            choose. No account, no server reading along, and no AI unless you
            turn it on, feature by feature.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

function Never() {
  return (
    <section className="px-4 md:px-16">
      <Reveal className="mx-auto flex max-w-328 flex-col gap-10 rounded-card-lg bg-ink px-6 py-12 md:px-20 md:py-18 lg:flex-row lg:gap-20">
        <div className="flex flex-col gap-3.5 lg:w-90 lg:shrink-0">
          <p className="font-medium text-saffron text-ui">
            What we will never do
          </p>
          <h2 className="font-display text-display-sm text-on-ink leading-heading-loose tracking-heading md:text-display">
            Some lines stay uncrossed.
          </h2>
        </div>
        <ul className="flex grow flex-col">
          {NEVER.map((line) => (
            <li
              className="flex items-center gap-5 border-paper-raised/12 border-b py-5 last:border-b-0"
              key={line}
            >
              <X className="shrink-0 text-daylily" size={18} strokeWidth={2} />
              <span className="font-writing text-lead text-on-ink-2 leading-7.5 md:text-lede">
                {line}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

/**
 * On wide screens the words sit in the painting's open cream area. On phones that
 * area is too small, so the words come first and the painting follows as a card.
 */
function WhyDaylily() {
  return (
    <section className="px-4 pt-14 md:px-16 md:pt-30">
      <Reveal className="mx-auto flex max-w-328 flex-col gap-7 md:relative md:aspect-[1312/738] md:overflow-clip md:rounded-card-lg">
        <div className="relative aspect-square overflow-clip rounded-3xl md:absolute md:inset-0 md:aspect-auto md:rounded-none">
          <Image
            alt="A single orange daylily among grasses and wildflowers"
            className="object-cover object-[78%_50%] md:object-right"
            fill
            sizes="(max-width: 1312px) 100vw, 1312px"
            src="/images/art/lily.jpg"
          />
        </div>
        <div className="relative -order-1 flex max-w-135 flex-col gap-4 px-2 md:order-none md:gap-5 md:px-20 md:pt-21">
          <p className="font-medium text-daylily-deep text-ui">Why Daylily</p>
          <h2 className="font-display text-5xl text-ink leading-heading-loose tracking-heading md:text-display-lg">
            Beauty for a day.
          </h2>
          <p className="font-writing text-ink-2 text-lead leading-7.75 md:text-xl md:leading-8.25">
            Daylilies, Hemerocallis in Greek, bloom for exactly one day, and a
            new flower opens the next morning. That is the one-page-a-day rule,
            as a flower.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

export default function ManifestoPage() {
  return (
    <>
      <main className="bg-paper-raised">
        <HeaderSpacer />
        <Masthead />
        <Lede />
        <SeenByYou />
        <Beliefs />
        <Never />
        <WhyDaylily />
      </main>
      <Footer />
    </>
  );
}
