import { matchRanges, type TextRange } from "@daylily/core/search-text";
import { cn } from "@daylily/ui/lib/cn";
import type { ReactNode } from "react";

/**
 * `text` with what was searched for marked in saffron, from ranges or found
 * with `query`; `glow` lets the marks fade, as on a day opened from search.
 */
export function Marked({
  text,
  marks,
  query,
  glow = false,
}: {
  text: string;
  marks?: readonly TextRange[];
  query?: string;
  glow?: boolean;
}) {
  const ranges = marks ?? (query ? matchRanges(text, query) : []);
  const parts: ReactNode[] = [];
  let at = 0;
  for (const [start, end] of ranges) {
    parts.push(text.slice(at, start));
    parts.push(
      <mark
        className={cn("search-match", glow && "search-match-glow")}
        key={start}
      >
        {text.slice(start, end)}
      </mark>
    );
    at = end;
  }
  parts.push(text.slice(at));
  return <>{parts}</>;
}
