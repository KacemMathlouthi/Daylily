import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@daylily/ui/primitives/hover-card";
import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { dateFormat } from "../../lib/format";
import type { JournalDay } from "../../lib/journal";
import { fromKey } from "../../lib/month";

const LONG_DATE = dateFormat({
  day: "numeric",
  month: "long",
  weekday: "long",
});
const NUMBER = new Intl.NumberFormat("en");

/**
 * Paper's peek: hover a flower to see its day's cover, date, length and title;
 * click it to open the day.
 */
export function DayPeek({
  dayKey,
  day,
  cell,
}: {
  dayKey: string;
  day: JournalDay;
  cell: ReactElement;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger
        closeDelay={80}
        delay={160}
        render={
          <Link
            aria-label={`${day.title}, ${LONG_DATE.format(fromKey(dayKey))}`}
            className="block rounded-full"
            params={{ key: dayKey }}
            to="/day/$key"
          />
        }
      >
        {cell}
      </HoverCardTrigger>
      <HoverCardContent
        className="flex w-75 gap-3 rounded-xl bg-ink p-2.5 text-on-ink shadow-toast ring-0"
        side="top"
        sideOffset={8}
      >
        {day.cover ? (
          <img
            alt=""
            className="h-14 w-18.5 shrink-0 rounded-row object-cover"
            height={404}
            src={day.cover}
            width={640}
          />
        ) : null}
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-medium text-on-ink-muted text-tag leading-3.5">
            {LONG_DATE.format(fromKey(dayKey))} · {NUMBER.format(day.words)}{" "}
            words
          </span>
          <span className="truncate font-display text-lead text-on-ink leading-5.5">
            {day.title}
          </span>
          <span className="pt-0.5 font-medium text-on-ink-muted text-tag leading-3.5">
            Open day →
          </span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
