import { BLOOM_MS } from "@daylily/ui/components/daylily-bloom";
import { useComputerName } from "../../lib/person";
import { TexturedBloom } from "../textured-bloom";

/** When the mark starts to open, once the greeting has risen. */
const BLOOM_DELAY_MS = 320;

/** How long the greeting stays before today's page: the bloom, then a breath. */
export const HELLO_MS = BLOOM_DELAY_MS + BLOOM_MS + 1300;

/**
 * Paper 10h: onboarding's goodbye. The person's name, the hand-printed mark
 * opening under it, and a word about the page waiting for them.
 */
export function Hello({ name, first }: { name: string; first: boolean }) {
  // Left empty, the name is the computer's, as everywhere else
  const computer = useComputerName();
  const shown = name || computer;
  return (
    <div className="flex grow flex-col items-center justify-center gap-7 px-10 text-center">
      <h1 className="font-display text-display-xl text-ink leading-none tracking-display motion-safe:animate-rise-in">
        {shown ? `Hello, ${shown}.` : "Hello."}
      </h1>
      <TexturedBloom delay={BLOOM_DELAY_MS} size={112} />
      <p
        className="text-body-sm text-ink-subtle leading-6 motion-safe:animate-rise-in"
        style={{ animationDelay: `${BLOOM_DELAY_MS + BLOOM_MS}ms` }}
      >
        {first ? "Your first page is ready." : "Today’s page is ready."}
      </p>
    </div>
  );
}
