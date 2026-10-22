import type { MockDay } from "../../mock/journal";

/** A day from a year ago, offered back: its cover, title and first line. */
export function OnThisDay({ day }: { day: MockDay }) {
  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-paper-page px-3.5 pt-3.5 pb-4.5">
      <img
        alt=""
        className="h-28 w-full rounded-lg object-cover"
        height={404}
        src={day.cover}
        width={640}
      />
      <div className="flex flex-col gap-1 px-1.5">
        <span className="font-semibold text-ink-faint text-meta uppercase leading-3.5 tracking-eyebrow">
          One year ago today
        </span>
        <h2 className="font-display text-ink text-lede leading-6.5">
          {day.title}
        </h2>
        {day.excerpt ? (
          <p className="line-clamp-2 font-writing text-ink-muted text-sm leading-5.25">
            {day.excerpt}
          </p>
        ) : null}
      </div>
    </section>
  );
}
