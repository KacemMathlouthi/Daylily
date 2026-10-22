import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { cn } from "@daylily/ui/lib/cn";

/**
 * Whether the page is kept. Until storage exists, words live only in memory, and
 * the bar says so rather than claim a save that didn't happen.
 */
export type SaveState = "blank" | "unsaved";

const WORDS = new Intl.NumberFormat("en");

/** The quiet line under the page: whether it's kept, the nudges, the word count. */
export function StatusBar({
  save,
  notice,
  ghostPrompts,
  words,
  className,
}: {
  save: SaveState;
  /** A passing message, such as after copying, shown in place of the save state. */
  notice: string | null;
  ghostPrompts: boolean;
  words: number;
  className?: string;
}) {
  const label =
    notice ??
    {
      blank: "Today’s page is saved to your journal from the first word.",
      unsaved:
        "Not saved yet: kept in memory until Daylily writes to your journal.",
    }[save];

  return (
    <footer
      className={cn(
        "sticky bottom-0 z-10 flex h-10 shrink-0 items-center justify-between gap-6 border-line border-t bg-paper-page px-5 text-ink-subtle text-meta",
        className
      )}
    >
      <p aria-live="polite" className="flex min-w-0 items-center gap-1.5">
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full transition-colors duration-200",
            save === "unsaved" ? "bg-saffron" : "bg-ink-ghost"
          )}
        />
        <span className="truncate">{label}</span>
      </p>
      <p className="flex shrink-0 items-center gap-4">
        <span className="flex items-center gap-1.5">
          <DaylilyMark
            className={ghostPrompts ? "text-daylily/50" : "text-ink-ghost"}
            size={12}
          />
          Ghost prompts {ghostPrompts ? "on" : "off"}
        </span>
        <span>
          {WORDS.format(words)} {words === 1 ? "word" : "words"}
        </span>
      </p>
    </footer>
  );
}
