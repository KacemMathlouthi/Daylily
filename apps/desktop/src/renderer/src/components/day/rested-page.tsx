import sprout from "../../assets/sprout.webp";
import { DayDate } from "./day-date";

/** A past day with nothing written (Paper: "04b"): bare soil, never guilt. */
export function RestedPage({ day }: { day: string }) {
  return (
    <>
      <div className="flex h-42.5 items-end justify-center rounded-xl bg-paper-sunk pb-4.5">
        <img
          alt=""
          className="h-29 w-auto opacity-90"
          height={252}
          src={sprout}
          width={239}
        />
      </div>
      <div className="flex flex-col gap-3.5 pt-7.5">
        <DayDate day={day} />
        <h1 className="font-display text-display-sm text-ink-soft leading-12 tracking-title">
          A day of rest
        </h1>
        <p className="pt-1 font-writing text-ink-subtle text-writing italic">
          Nothing was written this day, and that’s alright. Bare soil is part of
          every garden.
        </p>
      </div>
    </>
  );
}
