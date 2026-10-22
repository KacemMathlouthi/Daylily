import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@daylily/ui/primitives/hover-card";
import type { ReactElement } from "react";
import { dateFormat } from "../../lib/format";
import { fromKey } from "../../lib/month";
import type { MockDay } from "../../mock/journal";

const LONG_DATE = dateFormat({
  day: "numeric",
  month: "long",
  weekday: "long",
});
const NUMBER = new Intl.NumberFormat("en");

/**
 * Paper's peek: hover a flower to see its day's cover, date, length and title.
 * Paper's "Open day →" comes back with the sealed day view, when there's a day to open.
 */
export function DayPeek({
  dayKey,
  day,
  cell,
}: {
  dayKey: string;
  day: MockDay;
  cell: ReactElement;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger closeDelay={80} delay={160} render={cell} />
      <HoverCardContent
        className="flex w-75 gap-3 rounded-xl bg-ink p-2.5 text-on-ink shadow-toast ring-0"
        side="top"
        sideOffset={8}
      >
        <img
          alt=""
          className="h-14 w-18.5 shrink-0 rounded-row object-cover"
          height={404}
          src={day.cover}
          width={640}
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-medium text-on-ink-muted text-tag leading-3.5">
            {LONG_DATE.format(fromKey(dayKey))} · {NUMBER.format(day.words)}{" "}
            words
          </span>
          <span className="truncate font-display text-lead text-on-ink leading-5.5">
            {day.title}
          </span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
