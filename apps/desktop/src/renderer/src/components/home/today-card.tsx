import { Button } from "@daylily/ui/primitives/button";
import { Kbd } from "@daylily/ui/primitives/kbd";
import { Link } from "@tanstack/react-router";
import { SealCountdown } from "../seal-countdown";

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
          <SealCountdown now={now} />
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
