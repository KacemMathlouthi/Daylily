"use client";

import { cn } from "cn";
import {
  type MotionValue,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { Reveal } from "@/components/site/motion";

interface Segment {
  image?: { src: string; alt: string };
  italic?: boolean;
  text?: string;
}

const QUIET_LINES: Segment[][] = [
  [{ text: "Other journals want" }],
  [
    { text: "to write" },
    {
      image: {
        alt: "A grey bowl of soup by a rainy window",
        src: "/images/covers/rain-muted.jpg",
      },
    },
    { text: "for you." },
  ],
];

const LOUD_LINES: Segment[][] = [
  [
    { text: "Daylily asks" },
    {
      image: {
        alt: "A cup of tea on a sunny windowsill",
        src: "/images/covers/tea.jpg",
      },
    },
    { italic: true, text: "one question," },
  ],
  [{ text: "then listens." }],
];

function countWords(segments: Segment[]) {
  return segments.reduce(
    (count, segment) => count + (segment.text?.split(" ").length ?? 0),
    0
  );
}

const LOUD_WORD_COUNT = countWords(LOUD_LINES.flat());

function Pill({ src, alt }: { src: string; alt: string }) {
  return (
    <Reveal className="shrink-0" delay={0.15} y={0}>
      <motion.span
        className="relative block h-[0.875em] w-[1.77em] overflow-clip rounded-full"
        initial={{ scale: 0.6 }}
        transition={{ damping: 18, stiffness: 120, type: "spring" }}
        viewport={{ margin: "-10% 0px", once: true }}
        whileInView={{ scale: 1 }}
      >
        <Image
          alt={alt}
          className="object-cover"
          fill
          sizes="170px"
          src={src}
        />
      </motion.span>
    </Reveal>
  );
}

/** A word that inks in as the reader scrolls through the statement. */
function Word({
  children,
  index,
  progress,
}: {
  children: string;
  index: number;
  progress: MotionValue<number>;
}) {
  const start = index / LOUD_WORD_COUNT;
  const end = (index + 1) / LOUD_WORD_COUNT;
  const opacity = useTransform(progress, [start, end], [0.18, 1]);
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <span>{children}</span>;
  }
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

function Line({
  segments,
  quiet,
  progress,
  firstWord,
}: {
  segments: Segment[];
  quiet: boolean;
  progress: MotionValue<number>;
  firstWord: number;
}) {
  let wordIndex = firstWord;
  return (
    <div className="flex flex-wrap items-center gap-x-[0.23em]">
      {segments.map((segment) => {
        if (segment.image) {
          return <Pill key={segment.image.src} {...segment.image} />;
        }
        const words = segment.text?.split(" ") ?? [];
        return (
          <span
            className={cn(
              "flex gap-x-[0.24em]",
              segment.italic && "italic",
              quiet ? "text-ink-ghost" : "text-ink"
            )}
            key={segment.text}
          >
            {words.map((word) => {
              if (quiet) {
                return <span key={word}>{word}</span>;
              }
              const index = wordIndex;
              wordIndex += 1;
              return (
                <Word index={index} key={word} progress={progress}>
                  {word}
                </Word>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}

export function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    offset: ["start 75%", "end 55%"],
    target: ref,
  });

  let firstWord = 0;
  return (
    <section className="flex flex-col bg-paper-raised px-5 pt-24 pb-24 md:px-30 md:pt-35 md:pb-32.5">
      <div
        className="relative flex flex-col gap-1.5 font-display text-[clamp(40px,6.7vw,96px)] leading-[1.04] tracking-[-0.03em]"
        ref={ref}
      >
        {QUIET_LINES.map((segments) => (
          <Line
            firstWord={0}
            key={segments[0]?.text}
            progress={scrollYProgress}
            quiet
            segments={segments}
          />
        ))}
        {LOUD_LINES.map((segments) => {
          const start = firstWord;
          firstWord += countWords(segments);
          return (
            <Line
              firstWord={start}
              key={segments[0]?.text}
              progress={scrollYProgress}
              quiet={false}
              segments={segments}
            />
          );
        })}
        {/*
         * Sits beside "then listens.", aligned under "one question,". The offsets are in
         * em of the headline size, so they track the words at every width.
         */}
        <Reveal className="mt-10 lg:absolute lg:top-[3.44em] lg:left-[5.854em] lg:mt-0">
          <p className="max-w-105 font-sans text-[17px] text-ink-muted leading-7.25 tracking-normal md:text-lg">
            No autocomplete. No rewrites. No summaries poured into your page.
            Typos, half-thoughts and broken grammar all count, because they’re
            true.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
