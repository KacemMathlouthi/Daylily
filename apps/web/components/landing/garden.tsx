import Image from "next/image";
import { Reveal } from "@/components/site/motion";
import { GardenPanel } from "./garden-panel";

export function Garden() {
  return (
    <section
      className="relative flex scroll-mt-10 flex-col items-center gap-14 overflow-clip bg-garden-glow bg-paper-sunk px-4 pt-28 pb-32 md:px-16 md:pt-47.5 md:pb-50"
      id="garden"
    >
      <Reveal className="relative flex max-w-190 flex-col items-center gap-4.5 text-center">
        <p className="font-medium text-daylily text-ui">The garden</p>
        <h2 className="font-display text-5xl text-ink leading-none tracking-display md:text-display-xl">
          Every day you write
          <br />
          plants a flower.
        </h2>
        <p className="max-w-140 text-body text-ink-muted leading-7.25 md:text-lg">
          Missed days stay bare soil. Nothing wilts, no streaks break, and
          coming back is always welcome.
        </p>
      </Reveal>
      <div className="relative w-full max-w-275">
        {/* Planted on the panel's corner, its soil tucked behind the edge */}
        <Image
          alt=""
          className="pointer-events-none absolute bottom-[calc(100%-14px)] left-6.5 hidden h-50 w-auto mix-blend-multiply lg:block"
          height={640}
          src="/images/art/sprout.png"
          width={608}
        />
        <GardenPanel />
      </div>
    </section>
  );
}
