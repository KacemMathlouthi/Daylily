"use client";

import { Lock } from "lucide-react";
import { motion } from "motion/react";
import { EASE_SOFT } from "@/components/site/motion";

const fan = (rotate: number, x: number, y: number) => ({
  hidden: { opacity: 0, rotate: 0, x: 0, y: 40 },
  shown: { opacity: 1, rotate, x, y },
});

/** Yesterday's page on top of older ones, fanning out as it comes into view. */
export function SealedStack() {
  return (
    <motion.div
      className="relative mx-auto h-56 w-[min(340px,100%)] xl:absolute xl:top-53.5 xl:left-27 xl:mx-0"
      initial="hidden"
      transition={{ duration: 1.1, ease: EASE_SOFT, staggerChildren: 0.08 }}
      viewport={{ margin: "-15% 0px", once: true }}
      whileInView="shown"
    >
      <motion.div
        className="absolute inset-x-0 top-0 h-52.5 origin-top-left rounded-[14px] bg-ink-2"
        transition={{ duration: 1.1, ease: EASE_SOFT }}
        variants={fan(-6, -16, 22)}
      />
      <motion.div
        className="absolute inset-x-0 top-0 h-52.5 origin-top-left rounded-[14px] bg-ink-soft"
        transition={{ duration: 1.1, ease: EASE_SOFT }}
        variants={fan(-2.5, -8, 12)}
      />
      <motion.article
        className="absolute inset-x-0 top-0 flex h-55.5 origin-top-left flex-col gap-2 rounded-[14px] bg-paper-page px-5.5 py-5 shadow-[0_20px_40px_#00000059]"
        transition={{ duration: 1.1, ease: EASE_SOFT }}
        variants={fan(2, 0, 0)}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium text-[11.5px] text-ink-subtle">
            Monday, October 19
          </span>
          <motion.span
            className="flex items-center gap-1.25 rounded-full bg-paper-tint px-2 py-0.75 font-semibold text-[10.5px] text-ink-muted"
            transition={{ delay: 0.9, duration: 0.6, ease: EASE_SOFT }}
            variants={{
              hidden: { opacity: 0, scale: 1.4 },
              shown: { opacity: 1, scale: 1 },
            }}
          >
            <Lock size={10} strokeWidth={2.6} />
            Sealed
          </motion.span>
        </div>
        <h4 className="font-display text-[26px] text-ink leading-7.5">
          On my way
        </h4>
        <p className="font-writing text-ink-muted text-sm leading-5.5">
          Missed the 8:12 and waited with a coffee that was too hot to drink.
          Watched the platform empty and fill again. Strange how calm…
        </p>
      </motion.article>
    </motion.div>
  );
}
