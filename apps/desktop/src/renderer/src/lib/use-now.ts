import { useEffect, useState } from "react";

const MINUTE = 60_000;

/** The current time, updated on each minute so clocks and countdowns stay true. */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = new Date();
      setNow(current);
      timer = setTimeout(tick, MINUTE - (current.getTime() % MINUTE));
    };
    timer = setTimeout(tick, MINUTE - (Date.now() % MINUTE));
    window.addEventListener("focus", tick);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", tick);
    };
  }, []);

  return now;
}
