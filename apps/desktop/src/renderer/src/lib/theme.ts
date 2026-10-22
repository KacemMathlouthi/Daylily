import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
/** What the person chose: a theme, or to follow the system. */
export type ThemePreference = Theme | "system";

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

interface ThemeState {
  preference: ThemePreference;
  theme: Theme;
}

let state: ThemeState = { preference: "system", theme: "light" };
const listeners = new Set<() => void>();

/** The tokens switch on `.dark`; color-scheme keeps scrollbars and form controls in step. */
function apply(next: ThemeState) {
  state = next;
  const root = document.documentElement;
  root.classList.toggle("dark", next.theme === "dark");
  root.style.colorScheme = next.theme;
  for (const listener of listeners) {
    listener();
  }
}

/** Saves a choice, or forgets it to follow the system again. */
function choose(preference: ThemePreference) {
  if (preference === "system") {
    localStorage.removeItem(STORAGE_KEY);
    apply({ preference, theme: systemTheme() });
  } else {
    localStorage.setItem(STORAGE_KEY, preference);
    apply({ preference, theme: preference });
  }
}

/**
 * Applies the saved choice, or the system's, and keeps following the system
 * while it changes until a theme of our own is chosen.
 */
export function startTheme() {
  choose(storedTheme() ?? "system");
  matchMedia(SYSTEM_DARK).addEventListener("change", () => {
    if (state.preference === "system") {
      apply({ preference: "system", theme: systemTheme() });
    }
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme() {
  const { theme, preference } = useSyncExternalStore(subscribe, () => state);

  /** The sidebar's sun and moon: flips to the other theme and keeps it. */
  const toggleTheme = useCallback(() => {
    choose(state.theme === "dark" ? "light" : "dark");
  }, []);

  return { preference, setPreference: choose, theme, toggleTheme };
}
