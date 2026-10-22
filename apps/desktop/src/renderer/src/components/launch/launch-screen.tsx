import { BLOOM_MS, DaylilyBloom } from "@daylily/ui/components/daylily-bloom";
import { Progress } from "@daylily/ui/primitives/progress";
import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { useEffect, useState } from "react";
import dusk from "../../assets/dusk.jpg";
import { greetingFor } from "./greeting";
import { randomQuote } from "./quotes";
import { useMockLoading } from "./use-mock-loading";

/** Long enough for the bloom and the words to finish, even when loading is instant. */
const MIN_VISIBLE_MS = 1400;
/** Matches the fade-out's duration-400 below. */
const FADE_MS = 400;

/** Paper's "01 Launch": the dusk meadow, the bloom, a greeting and a quote while the journal opens. */
export function LaunchScreen() {
  const progress = useMockLoading();
  const [bloomed, setBloomed] = useState(false);
  const [gone, setGone] = useState(false);
  const [greeting] = useState(() => greetingFor(new Date()));
  const [quote] = useState(randomQuote);
  const { data: info } = useQuery({
    queryFn: () => window.daylily.app.info(),
    queryKey: ["app", "info"],
  });

  const leaving = bloomed && progress === 100;

  useEffect(() => {
    const timer = setTimeout(() => setBloomed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!leaving) {
      return;
    }
    // A timer rather than transitionend, which never fires under reduced motion
    const timer = setTimeout(() => setGone(true), FADE_MS);
    return () => clearTimeout(timer);
  }, [leaving]);

  if (gone) {
    return null;
  }

  return (
    <div
      aria-busy={!leaving}
      className={cn(
        "fixed inset-0 z-50 flex select-none flex-col items-center justify-center overflow-hidden bg-paper transition-opacity duration-400 ease-soft motion-reduce:transition-none",
        leaving && "pointer-events-none opacity-0"
      )}
    >
      <img
        alt=""
        className="absolute inset-0 size-full object-cover"
        height={941}
        src={dusk}
        width={1672}
      />
      <div className="absolute inset-0 bg-launch-veil" />
      {window.daylily.platform === "darwin" ? (
        <div className="absolute inset-x-0 top-0 h-12 [-webkit-app-region:drag]" />
      ) : null}

      <div className="relative -mt-10 flex flex-col items-center gap-5.5">
        <DaylilyBloom className="text-daylily" size={88} />
        <div
          className="flex animate-rise-in flex-col items-center gap-5.5 motion-reduce:animate-none"
          style={{ animationDelay: `${BLOOM_MS}ms` }}
        >
          <h1 className="font-display text-ink text-wordmark leading-none tracking-display">
            Daylily
          </h1>
          <p className="font-display text-ink-soft text-title-2xs italic leading-7.5">
            {greeting} Your garden is waking up.
          </p>
          <div className="flex flex-col items-center gap-2.5 pt-4.5">
            <Progress
              aria-label="Opening your journal"
              className="w-45 gap-0 *:data-[slot=progress-track]:h-0.75 *:data-[slot=progress-track]:rounded-xs **:data-[slot=progress-indicator]:bg-daylily *:data-[slot=progress-track]:bg-ink/10 **:data-[slot=progress-indicator]:duration-500 **:data-[slot=progress-indicator]:ease-soft"
              value={progress}
            />
            <figure className="flex w-90 flex-col items-center gap-2 pt-3.5 text-center">
              <blockquote className="font-writing text-body-sm text-ink-soft leading-5.5">
                “{quote.text}”
              </blockquote>
              <figcaption className="font-medium text-ink-muted text-tag uppercase leading-3.5 tracking-caps">
                {quote.author}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      <p className="absolute bottom-5.5 text-meta text-on-ink/88 leading-3.5">
        Daylily {info?.version} · your files never leave this folder
      </p>
    </div>
  );
}
