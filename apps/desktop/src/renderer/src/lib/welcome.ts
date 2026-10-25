import { createStore } from "./store";

/**
 * Onboarding's place in the app: showing until it's been through once on this
 * computer, and again from Help › Welcome to Daylily. Once through, it can be
 * left without finishing.
 */
const welcome = createStore({
  done: window.daylily.device.initial.onboarded,
  open: !window.daylily.device.initial.onboarded,
});

export const useWelcome = welcome.use;

export const openWelcome = () =>
  welcome.set((current) => ({ ...current, open: true }));

/** Leaves onboarding; `finished` when it was gone through to the end. */
export const closeWelcome = (finished: boolean) =>
  welcome.set((current) => ({ done: current.done || finished, open: false }));
