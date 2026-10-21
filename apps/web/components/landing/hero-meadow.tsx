"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";

/** The painted meadow behind the hero, drifting slower than the page as you scroll. */
export function HeroMeadow() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1200], [0, 160]);

  return (
    <motion.div
      aria-hidden="true"
      className="mask-[linear-gradient(transparent_0%,rgba(0,0,0,0.6)_14%,black_26%)] absolute bottom-0 left-1/2 h-[68%] w-[max(1956px,136%)] -translate-x-1/2"
      style={{ y }}
    >
      <Image
        alt=""
        className="object-cover"
        fill
        priority
        sizes="136vw"
        src="/images/art/meadow.jpg"
      />
    </motion.div>
  );
}
