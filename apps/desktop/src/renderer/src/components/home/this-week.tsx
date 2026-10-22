import { cn } from "@daylily/ui/lib/cn";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { dateFormat } from "../../lib/format";
import { type DayKey, fromKey } from "../../lib/month";
import type { MockDay } from "../../mock/journal";

const WEEKDAY = dateFormat({ weekday: "short" });

/** The six days before today and today's open page, as small covers. */
export function ThisWeek({
  days,
  entries,
}: {
  days: DayKey[];
  entries: ReadonlyMap<DayKey, MockDay>;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-ink text-title-2xs leading-7">
          This week
        </h2>
        <Link
          className="font-medium text-caption text-ink-subtle transition-colors hover:text-ink"
          to="/calendar"
        >
          Open calendar →
        </Link>
      </div>
      <div className="grid grid-cols-7 gap-2.5">
        {days.map((key) => {
          const entry = entries.get(key);
          const date = fromKey(key);
          const label = `${WEEKDAY.format(date)} ${date.getDate()}`;
          return (
            <div className="flex min-w-0 flex-col gap-1.5" key={key}>
              <div
                className={cn(
                  "flex aspect-19/12 items-center justify-center overflow-hidden rounded-md",
                  !entry && "bg-paper-tint"
                )}
              >
                {entry ? (
                  <img
                    alt=""
                    className="size-full object-cover"
                    height={404}
                    src={entry.cover}
                    width={640}
                  />
                ) : (
                  <span className="size-1.5 rounded-full bg-soil-soft" />
                )}
              </div>
              <span
                className={cn(
                  "text-meta leading-3.5",
                  entry ? "text-ink-subtle" : "text-ink-faint"
                )}
              >
                {entry ? label : `${label} · resting`}
              </span>
            </div>
          );
        })}
        <Link className="group flex min-w-0 flex-col gap-1.5" to="/today">
          <span className="flex aspect-19/12 items-center justify-center rounded-md border-[1.5px] border-daylily/45 border-dashed bg-daylily-wash transition-colors group-hover:border-daylily">
            <Plus className="size-4 text-daylily" strokeWidth={2} />
          </span>
          <span className="font-semibold text-daylily-deep text-meta leading-3.5">
            Today
          </span>
        </Link>
      </div>
    </section>
  );
}
