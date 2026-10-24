import { Lock, Pencil } from "lucide-react";
import { SealCountdown } from "../seal-countdown";

/** Today's pill: the time left before the page seals. */
export function CountdownPill({ now }: { now: Date }) {
  return (
    <span className="flex h-7 items-center rounded-full border border-daylily-wash-line bg-daylily-wash px-2.5 text-xs">
      <SealCountdown now={now} />
    </span>
  );
}

/** A past day's pill: when it sealed, quieter than today's countdown. */
export function SealedPill({ label }: { label: string }) {
  return (
    <span className="flex h-7 items-center gap-1.25 rounded-full border border-line-strong bg-paper-tint px-2.5 font-medium text-ink-muted text-xs">
      <Lock className="size-2.75 text-daylily-deep" strokeWidth={2.4} />
      {label}
    </span>
  );
}

/**
 * A sealed day changed in another app since (Paper: "04d"): said quietly, beside
 * the seal. Nothing is blocked or restored; the journal is the person's own.
 */
export function EditedMark() {
  return (
    <span
      className="flex h-7 items-center gap-1.5 px-2 font-medium text-ink-subtle text-xs"
      title="This page changed in another app after it sealed"
    >
      <Pencil className="size-3" strokeWidth={2} />
      Edited outside Daylily
    </span>
  );
}
