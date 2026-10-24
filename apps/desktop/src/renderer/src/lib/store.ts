import { useSyncExternalStore } from "react";

/**
 * A little shared state that outlives the screens that use it, such as today's
 * page while you visit the garden.
 */
export function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();

  const get = () => value;
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    get,
    set(next: T | ((current: T) => T)) {
      value =
        typeof next === "function" ? (next as (current: T) => T)(value) : next;
      for (const listener of listeners) {
        listener();
      }
    },
    subscribe,
    use: () => useSyncExternalStore(subscribe, get),
  };
}
