"use client";

import { MotionConfig, motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

export const EASE_SOFT = [0.22, 1, 0.36, 1] as const;

/** Honours the visitor's reduced-motion setting for every animation below it. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

type RevealProps = ComponentProps<typeof motion.div> & {
  delay?: number;
  y?: number;
};

/** Fades and rises its children into place the first time they scroll into view. */
export function Reveal({ delay = 0, y = 24, ...props }: RevealProps) {
  return (
    <motion.div
      data-reveal=""
      initial={{ opacity: 0, y }}
      transition={{ delay, duration: 0.9, ease: EASE_SOFT }}
      viewport={{ margin: "-10% 0px", once: true }}
      whileInView={{ opacity: 1, y: 0 }}
      {...props}
    />
  );
}
