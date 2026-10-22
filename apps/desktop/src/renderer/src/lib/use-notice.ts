import { useEffect, useState } from "react";

const NOTICE_MS = 2500;

/** A short message for the status bar, such as after copying, that clears itself. */
export function useNotice() {
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (notice === null) {
      return;
    }
    const timer = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice]);
  return [notice, setNotice] as const;
}
