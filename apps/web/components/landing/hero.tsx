import { AppleLogo } from "@/components/site/apple-logo";
import { ButtonLink } from "@/components/site/button-link";
import { HeaderSpacer } from "@/components/site/header-spacer";
import { Reveal } from "@/components/site/motion";
import { HeroMeadow } from "./hero-meadow";
import { TodayWindow } from "./today-window";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center overflow-clip bg-hero-sky pb-16 md:pb-22.5">
      <HeroMeadow />
      <HeaderSpacer />

      <div className="relative flex flex-col items-center gap-6.5 px-5 pt-12 text-center md:pt-23">
        <Reveal y={12}>
          <span className="flex items-center gap-2 rounded-full border border-white/80 bg-white/60 py-1.5 pr-3.5 pl-2 backdrop-blur-md">
            <span className="rounded-full bg-daylily px-2 py-0.75 font-semibold text-tag text-white uppercase leading-3.5 tracking-caps">
              New
            </span>
            <span className="font-medium text-ink-soft text-ui">
              A journal where AI asks, but never writes
            </span>
          </span>
        </Reveal>

        <h1 className="flex flex-col items-center font-display text-fluid-hero text-ink leading-display-tight tracking-display-tight">
          <Reveal delay={0.1}>One page a day.</Reveal>
          <Reveal className="italic" delay={0.22}>
            Yours to keep.
          </Reveal>
        </h1>

        <Reveal delay={0.34}>
          <p className="max-w-150 text-body text-ink-soft leading-7.5 md:text-lead">
            Daylily asks how your day was, then gets out of the way. Write it in
            your own words. At midnight the page seals, and a flower grows.
          </p>
        </Reveal>

        <Reveal className="flex flex-col items-center gap-6.5" delay={0.44}>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <ButtonLink href="/download" size="pill-lg" variant="ink">
              <AppleLogo />
              Download for Mac
            </ButtonLink>
            <ButtonLink href="/download" size="pill-lg" variant="paper">
              Windows &amp; Linux
            </ButtonLink>
          </div>
          <p className="text-ink-muted text-ui">
            Free &amp; open source · Your files stay on your machine
          </p>
        </Reveal>
      </div>

      <Reveal
        className="relative mt-16 flex w-full justify-center px-4 md:mt-28 md:px-10"
        delay={0.6}
        y={60}
      >
        <TodayWindow />
      </Reveal>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-15 bg-[url(/images/art/torn-edge.png)] bg-size-[100%_100%] bg-no-repeat"
      />
    </section>
  );
}
