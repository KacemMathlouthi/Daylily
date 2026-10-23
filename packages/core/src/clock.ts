/**
 * Where "now" comes from. Nothing in the app reads the system clock directly, so
 * sealing can be tested across boundaries, sleep and travel.
 */
export interface Clock {
  now: () => Date;
  /** The device's current IANA zone, like "Africa/Tunis". */
  timeZone: () => string;
}

export const systemClock: Clock = {
  now: () => new Date(),
  // A fresh formatter each time, so a change of zone while running is seen
  timeZone: () => new Intl.DateTimeFormat().resolvedOptions().timeZone,
};
