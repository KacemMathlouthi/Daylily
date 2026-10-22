/**
 * Dates in words, in the device's current time zone. An Intl formatter fixes its
 * zone when it's made, so one made at startup would keep the old zone after the
 * computer moves to a new one and name the wrong day. These make a fresh one
 * each time, which costs microseconds.
 */
export function dateFormat(options: Intl.DateTimeFormatOptions) {
  return {
    format: (date: Date) => new Intl.DateTimeFormat("en", options).format(date),
    formatToParts: (date: Date) =>
      new Intl.DateTimeFormat("en", options).formatToParts(date),
  };
}
