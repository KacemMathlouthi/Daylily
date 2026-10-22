import { useEffect, useState } from "react";
import { DAY_STARTS_AT_HOUR, type DayKey, todayKey } from "./month";

function msUntilNextBoundary(now: Date) {
  const next = new Date(now);
  next.setHours(DAY_STARTS_AT_HOUR, 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

/**
 * Today's key, kept current: a timer for the next 4am boundary, and a recheck on
 * focus, since timers drift or pause while the computer sleeps.
 */
export function useToday(): DayKey {
  const [today, setToday] = useState(() => todayKey(new Date()));

  useEffect(() => {
    const refresh = () => setToday(todayKey(new Date()));
    let timer: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      timer = setTimeout(() => {
        refresh();
        scheduleNext();
      }, msUntilNextBoundary(new Date()));
    };

    scheduleNext();
    window.addEventListener("focus", refresh);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return today;
}
