import { useEffect, useState } from "react";

/** [time in ms, progress out of 100]: a few uneven steps, the way real work arrives. */
const STEPS = [
  [150, 20],
  [450, 45],
  [800, 70],
  [1100, 90],
  [1350, 100],
] as const;

/**
 * Stands in for opening the journal (finding the folder, listing days, sealing
 * yesterday) until the storage layer exists. Returns progress out of 100.
 */
export function useMockLoading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timers = STEPS.map(([at, value]) =>
      setTimeout(() => setProgress(value), at)
    );
    return () => {
      for (const timer of timers) {
        clearTimeout(timer);
      }
    };
  }, []);

  return progress;
}
