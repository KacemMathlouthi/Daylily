import { createStore } from "./store";

/** Focus mode hides the sidebar and the writing screen's bars, leaving only the page. */
const focus = createStore(false);

export function useFocusMode() {
  return [focus.use(), focus.set] as const;
}
