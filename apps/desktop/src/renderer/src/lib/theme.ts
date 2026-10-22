import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

/** Machine-local for now; the journal's own config takes over once storage exists. */
const STORAGE_KEY = "daylily:theme";
const SYSTEM_DARK = "(prefers-color-scheme: dark)";

function storedTheme(): Theme | null {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
}

function systemTheme(): Theme {
  return matchMedia(SYSTEM_DARK).matches ? "dark" : "light";
}

let current: Theme = "light";
const listeners = new Set<() => void>();

/** The tokens switch on `.dark`; color-scheme keeps scrollbars and form controls in step. */
function setTheme(theme: Theme) {
  current = theme;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Applies the saved choice, or the system's, and keeps following the system
 * while it changes until the first toggle saves a choice of our own.
 */
export function startTheme() {
  setTheme(storedTheme() ?? systemTheme());
  matchMedia(SYSTEM_DARK).addEventListener("change", () => {
    if (!storedTheme()) {
      setTheme(systemTheme());
    }
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, () => current);

  const toggleTheme = useCallback(() => {
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  }, []);

  return { theme, toggleTheme };
}
