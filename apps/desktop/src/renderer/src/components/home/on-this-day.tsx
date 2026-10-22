import { cn } from "@daylily/ui/lib/cn";
import { Link } from "@tanstack/react-router";
import type { DayKey } from "../../lib/month";
import type { MockDay } from "../../mock/journal";
import { HOVER_LIFT_SELF, HOVER_WARM, HOVER_ZOOM } from "../day/hover";

/** A day from a year ago, offered back: its cover, title and first line. */
export function OnThisDay({ dayKey, day }: { dayKey: DayKey; day: MockDay }) {
  return (
    <Link
      className={cn(
        "group flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-paper-page px-3.5 pt-3.5 pb-4.5 hover:border-line-strong",
        HOVER_LIFT_SELF
      )}
      params={{ key: dayKey }}
      to="/day/$key"
    >
      <div className="h-28 overflow-hidden rounded-lg">
        <img
          alt=""
          className={cn("size-full object-cover", HOVER_ZOOM)}
          height={404}
          src={day.cover}
          width={640}
        />
      </div>
      <div className="flex flex-col gap-1 px-1.5">
        <span className="font-semibold text-ink-faint text-meta uppercase leading-3.5 tracking-eyebrow">
          One year ago today
        </span>
        <h2
          className={cn(
            "font-display text-ink text-lede leading-6.5",
            HOVER_WARM
          )}
        >
          {day.title}
        </h2>
        {day.excerpt ? (
          <p className="line-clamp-2 font-writing text-ink-muted text-sm leading-5.25">
            {day.excerpt}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
