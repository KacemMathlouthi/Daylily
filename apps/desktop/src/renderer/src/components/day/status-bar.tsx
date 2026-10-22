import { cn } from "@daylily/ui/lib/cn";
import type { ReactNode } from "react";

const WORDS = new Intl.NumberFormat("en");

export function wordCount(words: number) {
  return `${WORDS.format(words)} ${words === 1 ? "word" : "words"}`;
}

/**
 * The quiet line under a page: a dot and what's true about the page on the left,
 * details such as the word count on the right.
 */
export function StatusBar({
  dot,
  label,
  children,
  className,
}: {
  /** The dot's colour class. */
  dot: string;
  label: string;
  children?: ReactNode;
  className?: string;
}) {
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
            dot
          )}
        />
        <span className="truncate">{label}</span>
      </p>
      <p className="flex shrink-0 items-center gap-4">{children}</p>
    </footer>
  );
}
