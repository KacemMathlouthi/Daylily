import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
/** What the person chose: a theme, or to follow the system. */
export type ThemePreference = Theme | "system";

const SYSTEM_DARK = "(prefers-color-scheme: dark)";
const PREFERENCES: readonly string[] = ["light", "dark", "system"];

/** A preference from anywhere outside the code, such as the splash's address; the system's when it isn't one. */
export function asThemePreference(value: string | null): ThemePreference {
  return value !== null && PREFERENCES.includes(value)
    ? (value as ThemePreference)
    : "system";
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
/** Where a choice is kept: this computer's settings, through the main process. */
let save: (preference: ThemePreference) => void = () => undefined;

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

function applyPreference(preference: ThemePreference) {
  apply({
    preference,
    theme: preference === "system" ? systemTheme() : preference,
  });
}

/** Applies a choice and keeps it, or forgets it to follow the system again. */
function choose(preference: ThemePreference) {
  applyPreference(preference);
  save(preference);
}

/**
 * Applies the saved choice, or the system's, and keeps following the system
 * while it changes until a theme of our own is chosen. `keep` saves new choices;
 * a page that never changes the theme, like the splash, leaves it out.
 */
export function startTheme(
  preference: ThemePreference,
  keep?: (preference: ThemePreference) => void
) {
  if (keep) {
    save = keep;
  }
  applyPreference(preference);
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
