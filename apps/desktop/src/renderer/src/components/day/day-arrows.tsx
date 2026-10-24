import { cn } from "@daylily/ui/lib/cn";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import type { DayKey } from "../../lib/month";

const ARROW =
  "flex size-6.5 items-center justify-center rounded-row border border-line text-ink-muted transition-colors duration-150 hover:bg-paper-tint hover:text-ink";

/** Keys that belong to typing or another control, not to paging through days. */
function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * The sealed day's ‹ › (Paper: "04a"): the written days before and after, and
 * today's page after the last one. ← and → do the same. Undefined while the
 * journal is still being read, so an arrow never points the wrong way.
 */
export function DayArrows({
  previous,
  next,
}: {
  previous: DayKey | undefined;
  next: DayKey | "today" | undefined;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isTyping(event.target)
      ) {
        return;
      }
      if (event.key === "ArrowLeft" && previous) {
        navigate({ params: { key: previous }, to: "/day/$key" });
      } else if (event.key === "ArrowRight" && next === "today") {
        navigate({ to: "/today" });
      } else if (event.key === "ArrowRight" && next) {
        navigate({ params: { key: next }, to: "/day/$key" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate, next, previous]);

  return (
    <div className="flex items-center gap-0.5">
      {previous ? (
        <Link
          aria-label="Previous day"
          className={ARROW}
          params={{ key: previous }}
          to="/day/$key"
        >
          <ChevronLeft className="size-3.25" strokeWidth={2.1} />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={cn(ARROW, "opacity-40 hover:bg-transparent")}
        >
          <ChevronLeft className="size-3.25" strokeWidth={2.1} />
        </span>
      )}
      {next === "today" ? (
        <Link aria-label="Today’s page" className={ARROW} to="/today">
          <ChevronRight className="size-3.25" strokeWidth={2.1} />
        </Link>
      ) : null}
      {next && next !== "today" ? (
        <Link
          aria-label="Next day"
          className={ARROW}
          params={{ key: next }}
          to="/day/$key"
        >
          <ChevronRight className="size-3.25" strokeWidth={2.1} />
        </Link>
      ) : null}
      {next ? null : (
        <span
          aria-hidden="true"
          className={cn(ARROW, "opacity-40 hover:bg-transparent")}
        >
          <ChevronRight className="size-3.25" strokeWidth={2.1} />
        </span>
      )}
    </div>
  );
}
