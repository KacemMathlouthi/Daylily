import { Button } from "@daylily/ui/primitives/button";
import { Kbd } from "@daylily/ui/primitives/kbd";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { msUntilNextBoundary } from "../../lib/month";

const MINUTE = 60_000;

/** "3h 13m" until the next 4am boundary, or "42m" in the last hour. */
function sealsIn(now: Date) {
  const minutes = Math.ceil(msUntilNextBoundary(now) / MINUTE);
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

/** The invitation to write: today's state, when it seals, and the way in. */
export function TodayCard({ now, written }: { now: Date; written: boolean }) {
  const isMac = window.daylily.platform === "darwin";

  return (
    <section className="flex items-center justify-between gap-6 rounded-2xl border border-line bg-paper-page px-7 py-6.5 shadow-card-lift">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-ink text-title-md italic leading-9">
          How was your day?
        </h2>
        <p className="flex items-center gap-2 text-ui-lg leading-4.5">
          <span className="text-ink-muted">
            {written
              ? "You’ve started today’s page."
              : "Today’s page is still blank."}
          </span>
          <span className="text-ink-ghost">·</span>
          <span className="flex items-center gap-1.25 font-medium text-daylily-ink">
            <Lock className="size-2.75 text-daylily-deep" strokeWidth={2.4} />
            Seals in {sealsIn(now)}
          </span>
        </p>
      </div>
      <Button
        nativeButton={false}
        render={<Link to="/today" />}
        size="pill-md"
        variant="ink"
      >
        {written ? "Keep writing" : "Start writing"}
        <Kbd className="h-auto bg-on-ink/15 px-1.5 py-px font-semibold text-on-ink-2 text-tag">
          {isMac ? "⌘N" : "Ctrl N"}
        </Kbd>
      </Button>
    </section>
  );
}
