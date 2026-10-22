import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import Image from "next/image";
import { FOOTER_LINKS, GITHUB_URL } from "./links";
import { Reveal } from "./motion";
import { PillButton, PillLink } from "./pill-button";

/**
 * The dusk meadow and the giant wordmark. Proportions come from the 1440px design
 * (art band 760px tall, wordmark 460px, 270px down) and scale with the page width.
 * The word stands inside the meadow: the painting sits behind it, and a cutout of
 * the nearest lilies and grass sits in front of it.
 */
function DuskWordmark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative aspect-[1440/760] w-full"
    >
      <div className="mask-[linear-gradient(transparent_0%,black_18%)] absolute inset-x-0 bottom-0 aspect-[1672/941]">
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="100vw"
          src="/images/art/dusk.jpg"
        />
      </div>
      <p className="absolute inset-x-0 top-[35.5%] bg-[linear-gradient(180deg,#fffbf5_8%,#fff6ebd9_55%,#fff1e099_88%)] bg-clip-text text-center font-display text-[31.95vw] text-transparent leading-[0.87] tracking-[-0.045em] drop-shadow-[0_1.2vw_2.4vw_#5a2d1433]">
        Daylily
      </p>
      <div className="absolute inset-x-0 bottom-0 aspect-[1672/941]">
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="100vw"
          src="/images/art/dusk-near.webp"
        />
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative flex flex-col items-center overflow-clip bg-[linear-gradient(180deg,#fbf8f3_0%,#f8eee2_30%,#f6e7d5_48%)]">
      <Reveal className="relative z-10 flex flex-col items-center gap-6 px-5 pt-24 pb-24 text-center md:pt-32.5 md:pb-30">
        <h2 className="font-display text-[clamp(56px,7.8vw,112px)] text-ink leading-[0.93] tracking-[-0.035em]">
          How was your day?
        </h2>
        <p className="text-[#5a4a3e] text-[17px] leading-7.5 md:text-[19px]">
          Tonight is a good night to start. It takes about four minutes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1.5">
          <PillButton>Download Daylily</PillButton>
          <PillLink href={GITHUB_URL} tone="glass">
            Star on GitHub
          </PillLink>
        </div>
      </Reveal>

      <div className="relative z-10 mx-auto flex w-full max-w-328 flex-col justify-between gap-10 border-ink/10 border-t px-5 pt-10 md:flex-row md:px-8 xl:px-0">
        <div className="flex max-w-105 flex-col gap-3">
          <div className="flex items-center gap-2">
            <DaylilyMark className="text-ink" size={18} />
            <span className="font-display text-2xl text-ink">Daylily</span>
          </div>
          <p className="max-w-75 text-ink-muted text-sm leading-5.5">
            A human-first journal. One page a day, written by you, kept by you.
          </p>
          <p className="pt-1.5 text-[13px] text-ink-subtle">
            © 2026 Daylily · Free and open source
          </p>
        </div>
        <nav className="grid grid-cols-3 gap-6 md:flex md:gap-20">
          {FOOTER_LINKS.map((group) => (
            <div className="flex flex-col gap-2.5 md:w-35" key={group.heading}>
              <h3 className="font-semibold text-[13px] text-ink">
                {group.heading}
              </h3>
              {group.links.map((link) => (
                <a
                  className="text-ink-muted text-sm transition-colors duration-300 hover:text-ink"
                  href={link.href}
                  key={link.label}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <DuskWordmark />
    </footer>
  );
}
