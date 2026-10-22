import { useCallback, useEffect, useState } from "react";

const NOTICE_MS = 2500;

/**
 * A short message for the status bar, such as after copying, that clears itself.
 * Showing it again, even with the same words, starts its time over.
 */
export function useNotice() {
  const [notice, setNotice] = useState<{ text: string; shown: number } | null>(
    null
  );
  useEffect(() => {
    if (notice === null) {
      return;
    }
    const timer = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice]);
  const show = useCallback(
    (text: string) => setNotice({ shown: performance.now(), text }),
    []
  );
  return [notice?.text ?? null, show] as const;
}
