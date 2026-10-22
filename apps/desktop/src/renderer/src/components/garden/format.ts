const HOUR = new Intl.DateTimeFormat("en", { hour: "numeric" });

function hourParts(hour: number) {
  const parts = HOUR.formatToParts(new Date(2000, 0, 1, hour));
  const value = parts.find((part) => part.type === "hour")?.value ?? "";
  const period = parts.find((part) => part.type === "dayPeriod")?.value ?? "";
  return { period: period.toLowerCase(), value };
}

/** 21 → "9 – 10 pm"; 11 → "11 am – 12 pm". */
export function hourSpan(hour: number): string {
  const from = hourParts(hour);
  const to = hourParts((hour + 1) % 24);
  return from.period === to.period
    ? `${from.value} – ${to.value} ${to.period}`
    : `${from.value} ${from.period} – ${to.value} ${to.period}`;
}
