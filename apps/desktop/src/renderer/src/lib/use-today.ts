import { useEffect, useState } from "react";
import { type DayKey, msUntilNextBoundary, todayKey } from "./month";

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
