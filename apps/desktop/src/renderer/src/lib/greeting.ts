/** A hello that fits the hour: morning, afternoon, evening, or a quiet nod late at night. */
export function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return "Good morning.";
  }
  if (hour >= 12 && hour < 18) {
    return "Good afternoon.";
  }
  if (hour >= 18 && hour < 23) {
    return "Good evening.";
  }
  return "Still up?";
}
