"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { type ReactNode, useRef } from "react";

/** The dusk meadow and the giant wordmark, which rises out of it as the page ends. */
export function FooterArt({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    offset: ["start end", "end end"],
    target: ref,
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [-60, 0]);
  const wordY = useTransform(scrollYProgress, [0, 1], ["35%", "0%"]);
  const wordOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  return (
    <div className="relative mt-16 w-full md:mt-24" ref={ref}>
      <motion.div
        aria-hidden="true"
        className="mask-[linear-gradient(transparent_0%,black_30%)] absolute inset-x-0 -top-[20vw] bottom-0"
        style={{ y: imageY }}
      >
        <Image
          alt=""
          className="object-cover object-top"
          fill
          sizes="100vw"
          src="/images/art/dusk.jpg"
        />
      </motion.div>
      {children}
      <motion.p
        aria-hidden="true"
        className="relative mt-[clamp(80px,17vw,250px)] mb-[-0.08em] bg-[linear-gradient(180deg,#fffbf5f7_10%,#fff6eb8c_85%)] bg-clip-text text-center font-display text-[32vw] text-transparent leading-[0.87] tracking-[-0.045em]"
        style={{ opacity: wordOpacity, y: wordY }}
      >
        Daylily
      </motion.p>
    </div>
  );
}
