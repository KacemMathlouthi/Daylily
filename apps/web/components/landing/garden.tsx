import Image from "next/image";
import { GardenPanel } from "./garden-panel";
import { Reveal } from "./motion";

export function Garden() {
  return (
    <section
      className="relative flex scroll-mt-10 flex-col items-center gap-14 overflow-clip bg-[#f7f2ea] bg-[linear-gradient(180deg,#fbf8f3_0%,#fbf8f300_22%,#fbf8f300_78%,#fbf8f3_100%),radial-gradient(ellipse_45%_38%_at_16%_38%,#fbe1c4_0%,#fbe1c400_70%),radial-gradient(ellipse_40%_36%_at_86%_70%,#f7dae2_0%,#f7dae200_70%),radial-gradient(ellipse_50%_40%_at_58%_22%,#e4edda_0%,#e4edda00_70%)] px-4 pt-28 pb-32 md:px-16 md:pt-47.5 md:pb-50"
      id="garden"
    >
      <Image
        alt=""
        className="absolute top-22.5 left-17.5 hidden h-50 w-auto origin-bottom -rotate-6 mix-blend-multiply motion-safe:animate-sway lg:block"
        height={640}
        src="/images/art/sprout.png"
        width={608}
      />
      <Reveal className="relative flex max-w-190 flex-col items-center gap-4.5 text-center">
        <p className="font-medium text-[13px] text-daylily">The garden</p>
        <h2 className="font-display text-[48px] text-ink leading-none tracking-[-0.03em] md:text-[80px]">
          Every day you write
          <br />
          plants a flower.
        </h2>
        <p className="max-w-140 text-[17px] text-ink-muted leading-7.25 md:text-lg">
          Missed days stay bare soil. Nothing wilts, no streaks break, and
          coming back is always welcome.
        </p>
      </Reveal>
      <GardenPanel />
    </section>
  );
}
