import { createStore } from "./store";

/**
 * Journal preferences shared by Settings and the writing screen. In memory until
 * they're read from and written to the journal's `.daylily/config.json`.
 */
const ghostPrompts = createStore(true);

export function useGhostPrompts() {
  return [ghostPrompts.use(), ghostPrompts.set] as const;
}
