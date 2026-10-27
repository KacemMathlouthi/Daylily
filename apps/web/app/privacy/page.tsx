import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/site/button-link";
import { Footer } from "@/components/site/footer";
import { HeaderSpacer } from "@/components/site/header-spacer";
import { GITHUB_URL } from "@/components/site/links";
import { Reveal } from "@/components/site/motion";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  description:
    "What Daylily keeps on your computer, and what it asks the internet. Your words stay home.",
  path: "/privacy",
  title: "Privacy · Daylily",
});

const IN_SHORT = [
  "Everything you write stays in a folder on your computer.",
  "No account, no analytics, no tracking. Nothing to sign up for.",
  "The app asks the internet for two things: new versions, and on Linux a spelling dictionary.",
  "When AI comes, it’s off until you turn it on, and says what it sends.",
];

const QUESTIONS = [
  { href: `${GITHUB_URL}/discussions`, label: "Ask in Discussions" },
  { href: `${GITHUB_URL}/issues/new/choose`, label: "Open an issue" },
  { href: `${GITHUB_URL}/security/policy`, label: "Security policy" },
];

function Masthead() {
  return (
    <Reveal className="flex flex-col items-center gap-7 px-5 pt-16 pb-14 text-center md:px-30 md:pt-30 md:pb-18">
      <p className="font-medium text-daylily text-ui">Privacy</p>
      <h1 className="font-display text-fluid-page text-ink leading-display tracking-display-tight">
        Your words stay home.
        <br />
        <em>We never see them.</em>
      </h1>
      <p className="text-ink-subtle text-sm">
        Daylily · Updated October 2026 · A two minute read
      </p>
    </Reveal>
  );
}

function Painting() {
  return (
    <Reveal className="flex flex-col items-center gap-3.5 px-4 pb-14 md:px-16 md:pb-18">
      <div className="relative aspect-[3/2] w-full max-w-280 overflow-clip rounded-3xl md:aspect-[1120/540] md:rounded-card-lg">
        <Image
          alt="A closed journal on a desk at night, in a single pool of lamplight, an orange daylily laid across it like a bookmark"
          className="object-cover object-[60%_55%]"
          fill
          priority
          sizes="(max-width: 1120px) 100vw, 1120px"
          src="/images/art/journal-kept.jpg"
        />
      </div>
      <p className="text-caption text-ink-faint">
        A journal kept at home, and only there.
      </p>
    </Reveal>
  );
}

function InShort() {
  return (
    <Reveal className="flex flex-col gap-5 rounded-panel bg-paper px-6 py-8 md:px-10 md:py-9">
      <p className="font-medium text-daylily text-ui">In short</p>
      <ul className="flex flex-col gap-3.5">
        {IN_SHORT.map((point) => (
          <li className="flex gap-3.5" key={point}>
            <span className="flex h-7 w-2 shrink-0 items-center">
              <span className="size-1.75 rounded-full bg-daylily" />
            </span>
            <span className="text-body text-ink leading-7">{point}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function Section({
  title,
  aside,
  children,
}: {
  title: string;
  /** A quiet label beside the title, such as for what isn't in the app yet. */
  aside?: string;
  children: ReactNode;
}) {
  return (
    <Reveal className="flex flex-col gap-4 border-line border-t pt-8">
      <h2 className="flex flex-wrap items-baseline gap-x-3.5 gap-y-2 font-display text-display-xs text-ink leading-11 tracking-heading-sm">
        {title}
        {aside ? (
          <span className="rounded-full border border-line-strong px-2.75 py-1.25 font-medium font-sans text-ink-subtle text-ui leading-4 tracking-normal">
            {aside}
          </span>
        ) : null}
      </h2>
      <div className="flex flex-col gap-4 font-writing text-ink-soft text-xl leading-8.25">
        {children}
      </div>
    </Reveal>
  );
}

function Sections() {
  return (
    <div className="flex flex-col gap-14 pt-22 pb-35">
      <Section title="What happens to your words">
        <p>
          Nothing leaves your computer. Your days, your thoughts and your notes
          are plain markdown files in a folder you chose, like ~/Daylily. Covers
          and pictures are copied in beside them. The app’s own settings, like
          the window’s size and your theme, stay on this computer too.
        </p>
        <p>
          Search is built on your computer when Daylily opens, held in memory,
          and never written anywhere. What you search for stays there too. There
          is no account, no analytics and no telemetry in the app. We never see
          a word you write, because there is nowhere for it to go.
        </p>
      </Section>
      <Section title="What it asks the internet">
        <p>
          Daylily looks for a new version on its GitHub releases when it opens,
          then every six hours while it runs. Where it can update itself, it
          downloads the new version from there too. You can also look by hand in
          Settings, under About.
        </p>
        <p>
          That request carries nothing from your journal. Like any visit to a
          website, it shows GitHub your IP address and which version of Daylily
          you have. GitHub’s own privacy statement covers what they do with it.
        </p>
        <p>
          On Linux, Daylily also fetches a spelling dictionary for your language
          from Google’s servers the first time it opens, as Chrome does, so it
          can underline a misspelled word. Only the dictionary comes back;
          nothing you write goes with it. On macOS and Windows, the computer’s
          own spellchecker is used.
        </p>
      </Section>
      <Section title="This website">
        <p>
          daylily.ink has no analytics, no cookies and no trackers. Its fonts
          are served from here, not from anyone else. It is hosted by Vercel,
          which, like any host, sees the requests that reach it. Downloads come
          from GitHub.
        </p>
      </Section>
      <Section aside="Not in the app yet" title="When AI comes">
        <p>
          AI will be off until you turn it on, one feature at a time, with the
          provider you choose or a model running on your own computer. Each
          feature says plainly what it sees. Ghost prompts see only today’s
          page. Before anything sends past days, you’ll read “this sends 12 days
          to your provider” and decide.
        </p>
        <p>
          Your keys go in your computer’s keychain, never in your journal
          folder. What a provider does with what you send is up to them, so pick
          one you trust, or keep it all at home with a local model.
        </p>
      </Section>
      <Section title="If you have a question">
        <p>
          Daylily is open source, so every line of this can be checked. Ask
          anything in GitHub Discussions, or open an issue. If you find a way
          someone could read, change or lose a person’s writing, please don’t
          post it in public: report it privately, as our security policy
          explains.
        </p>
        <div className="flex flex-wrap gap-2.5 pt-2 font-sans">
          {QUESTIONS.map(({ href, label }) => (
            <ButtonLink href={href} key={label} size="pill-md" variant="paper">
              {label}
            </ButtonLink>
          ))}
        </div>
      </Section>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <main className="bg-paper-raised">
        <HeaderSpacer />
        <Masthead />
        <Painting />
        <article className="mx-auto flex max-w-170 flex-col px-5">
          <Reveal className="pb-16 font-writing text-2xl text-ink-2 leading-9.5">
            A journal holds the things you tell no one else. So Daylily is built
            to keep them on your computer, and to tell you plainly about the few
            times it reaches for the internet.
          </Reveal>
          <InShort />
          <Sections />
        </article>
      </main>
      <Footer />
    </>
  );
}
