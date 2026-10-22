import { AppleLogo } from "@/components/site/apple-logo";
import { HeaderSpacer } from "@/components/site/header-spacer";
import { Reveal } from "@/components/site/motion";
import { PillLink } from "@/components/site/pill-button";
import { HeroMeadow } from "./hero-meadow";
import { TodayWindow } from "./today-window";

export function Hero() {
  return (
    <section className="relative flex flex-col items-center overflow-clip bg-[linear-gradient(180deg,#b4cfec_0%,#c6daec_22%,#d9e2e6_40%,#e8e2d6_52%,#ebdcc6_62%)] pb-16 md:pb-22.5">
      <HeroMeadow />
      <HeaderSpacer />

      <div className="relative flex flex-col items-center gap-6.5 px-5 pt-12 text-center md:pt-23">
        <Reveal y={12}>
          <span className="flex items-center gap-2 rounded-full border border-white/80 bg-white/60 py-1.5 pr-3.5 pl-2 backdrop-blur-md">
            <span className="rounded-full bg-daylily px-2 py-0.75 font-semibold text-[11px] text-white uppercase leading-3.5 tracking-[0.06em]">
              New
            </span>
            <span className="font-medium text-[13px] text-ink-soft">
              A journal where AI asks, but never writes
            </span>
          </span>
        </Reveal>

        <h1 className="flex flex-col items-center font-display text-[clamp(56px,9.45vw,136px)] text-ink leading-[0.91] tracking-[-0.035em]">
          <Reveal delay={0.1}>One page a day.</Reveal>
          <Reveal className="italic" delay={0.22}>
            Yours to keep.
          </Reveal>
        </h1>

        <Reveal delay={0.34}>
          <p className="max-w-150 text-[17px] text-ink-soft leading-7.5 md:text-[19px]">
            Daylily asks how your day was, then gets out of the way. Write it in
            your own words. At midnight the page seals, and a flower grows.
          </p>
        </Reveal>

        <Reveal className="flex flex-col items-center gap-6.5" delay={0.44}>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <PillLink href="/download">
              <AppleLogo />
              Download for Mac
            </PillLink>
            <PillLink href="/download" tone="paper">
              Windows &amp; Linux
            </PillLink>
          </div>
          <p className="text-[13px] text-ink-muted">
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
