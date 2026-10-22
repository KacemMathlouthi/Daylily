import { Nav } from "@/components/site/header";
import { Reveal } from "@/components/site/motion";
import { PillButton } from "@/components/site/pill-button";
import { HeroMeadow } from "./hero-meadow";
import { TodayWindow } from "./today-window";

function AppleLogo() {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      height="16"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M16.4 12.6c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9s-2-.9-3.3-.9c-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.8 1.2 1.8 2.6 3.1 2.5 1.3 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4 1-1.4 1.3-2.7 1.4-2.8-.1 0-2.5-1-2.5-4.1zM14 5.1c.7-.8 1.1-1.9 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative flex flex-col items-center overflow-clip bg-[linear-gradient(180deg,#b4cfec_0%,#c6daec_22%,#d9e2e6_40%,#e8e2d6_52%,#ebdcc6_62%)] pb-16 md:pb-22.5">
      <HeroMeadow />
      <Nav />

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
            <PillButton>
              <AppleLogo />
              Download for Mac
            </PillButton>
            <PillButton tone="glass">Windows &amp; Linux</PillButton>
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
