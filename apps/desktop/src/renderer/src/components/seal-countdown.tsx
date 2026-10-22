import { Lock } from "lucide-react";
import { msUntilNextBoundary } from "../lib/month";

const MINUTE = 60_000;

/** "3h 13m" until the next 4am boundary, or "42m" in the last hour. */
function sealsIn(now: Date) {
  const minutes = Math.ceil(msUntilNextBoundary(now) / MINUTE);
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

/** The small lock and countdown to today's seal. */
export function SealCountdown({ now }: { now: Date }) {
  return (
    <span className="flex items-center gap-1.25 font-medium text-daylily-ink">
      <Lock className="size-2.75 text-daylily-deep" strokeWidth={2.4} />
      Seals in {sealsIn(now)}
    </span>
  );
}
