import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { cn } from "@daylily/ui/lib/cn";

export type SaveState = "blank" | "saving" | "saved";

const WORDS = new Intl.NumberFormat("en");

/** The quiet line under the page: whether it's kept, the nudges, the word count. */
export function StatusBar({
  save,
  path,
  notice,
  ghostPrompts,
  words,
  className,
}: {
  save: SaveState;
  /** Where the page lives in the journal folder. */
  path: string;
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
      saved: `Saved to ${path}`,
      saving: "Saving…",
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
            save === "saved" ? "bg-leaf" : "bg-ink-ghost"
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
