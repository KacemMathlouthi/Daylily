import { cn } from "@daylily/ui/lib/cn";
import { Kbd, KbdGroup } from "@daylily/ui/primitives/kbd";

/** The key shortcuts are held with: ⌘ on macOS, Ctrl elsewhere. */
export const MOD_KEY = window.daylily.platform === "darwin" ? "⌘" : "Ctrl";

const TONES = {
  /** On a dark button, as Home's "Keep writing". */
  ink: "border-on-ink/20 bg-on-ink/12 text-on-ink-2",
  /** On paper, as beside a hint or a field. */
  paper: "border-line bg-paper-sunk text-ink-muted",
};

/**
 * A shortcut as the keys it's made of, each on its own cap with a plus between
 * them: Ctrl + K. Read aloud as one, like "Ctrl + K".
 */
export function Shortcut({
  keys,
  tone = "paper",
  className,
}: {
  keys: readonly string[];
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <KbdGroup aria-label={keys.join(" + ")} className={cn("gap-1", className)}>
      {keys.map((key, index) => (
        <span className="contents" key={key}>
          {index > 0 ? (
            <span
              aria-hidden="true"
              className={cn(
                "text-tag",
                tone === "ink" ? "text-on-ink-2/70" : "text-ink-faint"
              )}
            >
              +
            </span>
          ) : null}
          <Kbd
            aria-hidden="true"
            className={cn(
              "h-5 min-w-5 rounded-[5px] border px-1.5 font-medium font-sans text-tag leading-4",
              TONES[tone]
            )}
          >
            {key}
          </Kbd>
        </span>
      ))}
    </KbdGroup>
  );
}
