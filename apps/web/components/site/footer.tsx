import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import Image from "next/image";
import { FEATURES } from "@/app/features/features";
import { ButtonLink } from "@/components/site/button-link";
import { FOOTER_LINKS, GITHUB_URL } from "./links";
import { Reveal } from "./motion";

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
      <p className="absolute inset-x-0 top-[35.5%] text-center font-display text-fluid-wordmark text-wordmark-ink leading-wordmark tracking-wordmark">
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

/** Product, the feature pages, Principles and Community (Paper "Footer · links · 2026"). */
const GROUPS = [
  FOOTER_LINKS.product,
  {
    heading: "Features",
    links: FEATURES.map(({ name, slug }) => ({
      href: `/features/${slug}`,
      label: name,
    })),
  },
  FOOTER_LINKS.principles,
  FOOTER_LINKS.community,
];

export function Footer() {
  return (
    <footer className="relative flex flex-col items-center overflow-clip bg-dusk-fade">
      <Reveal className="relative z-10 flex flex-col items-center gap-6 px-5 pt-24 pb-24 text-center md:pt-32.5 md:pb-30">
        <h2 className="font-display text-fluid-closing text-ink leading-display tracking-display-tight">
          How was your day?
        </h2>
        <p className="text-body text-ink-soft leading-7.5 md:text-lead">
          Tonight is a good night to start. It takes about four minutes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1.5">
          <ButtonLink href="/download" size="pill-lg" variant="ink">
            Download Daylily
          </ButtonLink>
          <ButtonLink href={GITHUB_URL} size="pill-lg" variant="paper">
            Star on GitHub
          </ButtonLink>
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
          <p className="pt-1.5 text-ink-subtle text-ui">
            © 2026 Daylily · Free and open source
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-5 gap-y-8 md:flex md:gap-16">
          {GROUPS.map((group) => (
            <div
              className="flex flex-col gap-2.5 md:min-w-35"
              key={group.heading}
            >
              <h3 className="font-semibold text-ink text-ui">
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
