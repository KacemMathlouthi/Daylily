import { useEffect, useState } from "react";
import type { UpdateState } from "../../../shared/channels";

/** Where updating stands, kept current as the main process reports it. Null until first asked. */
export function useUpdates() {
  const [state, setState] = useState<UpdateState | null>(null);
  useEffect(() => {
    let current = true;
    window.daylily.updates.state().then((initial) => {
      if (current) {
        setState(initial);
      }
    });
    const stop = window.daylily.updates.onChange(setState);
    return () => {
      current = false;
      stop();
    };
  }, []);
  return state;
}

/** Saves every page, then quits and installs the downloaded version. */
export function installUpdate() {
  window.daylily.updates.install();
}

/** Puts the sidebar's card away until a newer version comes. */
export function dismissUpdate() {
  window.daylily.updates.dismiss();
}

/** Looks for a new version now. */
export function checkForUpdate() {
  window.daylily.updates.check();
}
