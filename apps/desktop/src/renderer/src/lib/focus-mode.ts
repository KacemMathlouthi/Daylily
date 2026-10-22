import { cn } from "@daylily/ui/lib/cn";
import { useEffect, useState } from "react";
import { createStore } from "./store";

/** Focus mode hides the sidebar and the page's bars, leaving only the page. */
const focus = createStore(false);

/** In focus mode the bars come back on a mouse move, then fade after this long. */
const CHROME_IDLE_MS = 2000;

export function useFocusMode() {
  return [focus.use(), focus.set] as const;
}

/**
 * Focus mode for a page screen: the sidebar goes (the shell reads the same flag),
 * the bars fade while you type or read and return when the mouse moves. Esc
 * leaves it, and so does leaving the screen. `chrome` styles the bars.
 */
export function useFocusChrome() {
  const [focused, setFocused] = useFocusMode();
  const [chromeVisible, setChromeVisible] = useState(true);

  useEffect(() => () => setFocused(false), [setFocused]);

  useEffect(() => {
    if (!focused) {
      setChromeVisible(true);
      return;
    }
    setChromeVisible(false);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reveal = () => {
      setChromeVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setChromeVisible(false), CHROME_IDLE_MS);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        setFocused(false);
        return;
      }
      clearTimeout(timer);
      setChromeVisible(false);
    };
    window.addEventListener("mousemove", reveal);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", reveal);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [focused, setFocused]);

  // The bars stay reachable by hover and keyboard while faded
  const chrome = cn(
    "transition-opacity duration-400 ease-soft",
    !chromeVisible && "opacity-0 focus-within:opacity-100 hover:opacity-100"
  );

  return { chrome, focused, setFocused };
}
