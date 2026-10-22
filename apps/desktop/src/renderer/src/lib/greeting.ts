/**
 * A hello that fits the hour: morning, afternoon, evening, or a quiet nod late at
 * night. With a name: "Good evening, Kacem." or "Still up, Kacem?"
 */
export function greetingFor(date: Date, name?: string | null): string {
  const hour = date.getHours();
  const to = name ? `, ${name}` : "";
  if (hour >= 5 && hour < 12) {
    return `Good morning${to}.`;
  }
  if (hour >= 12 && hour < 18) {
    return `Good afternoon${to}.`;
  }
  if (hour >= 18 && hour < 23) {
    return `Good evening${to}.`;
  }
  return `Still up${to}?`;
}
