import { dateFormat } from "../../lib/format";
import { fromKey } from "../../lib/month";

const DATE = dateFormat({
  day: "numeric",
  month: "long",
  weekday: "long",
});

/** The small date over a page's title. */
export function DayDate({ day }: { day: string }) {
  return (
    <p className="font-medium text-ink-subtle text-xs tracking-label">
      {DATE.format(fromKey(day))}
    </p>
  );
}
