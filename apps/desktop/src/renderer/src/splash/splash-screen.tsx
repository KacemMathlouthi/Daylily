import { BLOOM_MS, DaylilyBloom } from "@daylily/ui/components/daylily-bloom";
import { Progress } from "@daylily/ui/primitives/progress";
import { useEffect, useState } from "react";
import dusk from "../assets/dusk.jpg";
import { randomQuote } from "./quotes";

/** The event the main process sends as the journal opens, with progress out of 100. */
const PROGRESS_EVENT = "daylily:progress";

function useLaunchProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onProgress = (event: Event) => {
      const value = (event as CustomEvent<unknown>).detail;
      if (typeof value === "number") {
        setProgress((current) => Math.max(current, value));
      }
    };
    window.addEventListener(PROGRESS_EVENT, onProgress);
    return () => window.removeEventListener(PROGRESS_EVENT, onProgress);
  }, []);
  return progress;
}

/**
 * Paper's "01c Launch · splash window": a small card that appears the moment
 * Daylily starts, blooming over the dusk meadow while the app loads behind it.
 */
export function SplashScreen() {
  const progress = useLaunchProgress();
  const [quote] = useState(randomQuote);

  return (
    <div
      aria-busy={progress < 100}
      className="flex h-full select-none flex-col items-center bg-paper-raised [-webkit-app-region:drag]"
    >
      <div className="relative flex h-47.5 w-full shrink-0 items-center justify-center">
        <img
          alt=""
          className="absolute inset-0 size-full object-cover object-[50%_60%]"
          height={941}
          src={dusk}
          width={1672}
        />
        <div className="absolute inset-0 bg-linear-to-b from-45% from-transparent to-paper-raised" />
        <DaylilyBloom className="relative text-daylily" size={64} />
      </div>
      <div
        className="flex animate-rise-in flex-col items-center gap-1.5 px-7 pt-1 motion-reduce:animate-none"
        style={{ animationDelay: `${BLOOM_MS}ms` }}
      >
        <h1 className="font-display text-ink text-title leading-9 tracking-heading-sm">
          Daylily
        </h1>
        <p className="text-caption text-ink-subtle">Opening your journal…</p>
      </div>
      <Progress
        aria-label="Opening your journal"
        className="mt-5 w-45 gap-0 *:data-[slot=progress-track]:h-1 *:data-[slot=progress-track]:rounded-full **:data-[slot=progress-indicator]:bg-daylily *:data-[slot=progress-track]:bg-line **:data-[slot=progress-indicator]:duration-500 **:data-[slot=progress-indicator]:ease-soft"
        value={progress}
      />
      <figure className="mt-auto flex flex-col items-center gap-1 px-7.5 pb-6.5 text-center">
        <blockquote className="font-writing text-ink-muted text-ui italic leading-4.75">
          “{quote.text}”
        </blockquote>
        <figcaption className="text-ink-faint text-tag">
          {quote.author}
        </figcaption>
      </figure>
    </div>
  );
}
