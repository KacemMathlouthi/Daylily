"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE_SOFT } from "./motion";

const TYPE_DELAY_MS = 900;
const KEYSTROKE_MS = 55;
const PAUSE_BEFORE_PROMPT_MS = 1400;

interface GhostLineProps {
  prompt: string;
  text: string;
}

/**
 * The signature interaction: a sentence is typed, the writer pauses,
 * and a quiet question fades in at the cursor.
 */
export function GhostLine({ text, prompt }: GhostLineProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px", once: true });
  const reduceMotion = useReducedMotion();
  const [typed, setTyped] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!inView) {
      return;
    }
    if (reduceMotion) {
      setTyped(text.length);
      setPaused(true);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= text.length; i += 1) {
      timers.push(
        setTimeout(() => setTyped(i), TYPE_DELAY_MS + i * KEYSTROKE_MS)
      );
    }
    const typingEnds = TYPE_DELAY_MS + text.length * KEYSTROKE_MS;
    timers.push(
      setTimeout(() => setPaused(true), typingEnds + PAUSE_BEFORE_PROMPT_MS)
    );

    return () => {
      for (const timer of timers) {
        clearTimeout(timer);
      }
    };
  }, [inView, reduceMotion, text]);

  return (
    <p className="relative" ref={ref}>
      {/* Reserves the final line height so typing never shifts the layout */}
      <span aria-hidden="true" className="invisible">
        {text}
        <span className="pl-2 italic">{prompt}</span>
      </span>
      <span className="absolute inset-0">
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">{text.slice(0, typed)}</span>
        <span
          aria-hidden="true"
          className="ml-0.5 inline-block h-[1.15em] w-[1.5px] translate-y-[0.2em] animate-caret bg-daylily"
        />
        <AnimatePresence>
          {paused ? (
            <motion.span
              animate={{ opacity: 1, x: 0 }}
              className="pl-2 text-ghost italic"
              initial={{ opacity: 0, x: -4 }}
              transition={{ duration: 1.2, ease: EASE_SOFT }}
            >
              {prompt}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </p>
  );
}
