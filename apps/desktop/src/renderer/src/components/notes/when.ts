import { dateFormat } from "../../lib/format";
import { dayKey } from "../../lib/month";

const SAME_YEAR = dateFormat({ day: "numeric", month: "short" });
const OTHER_YEAR = dateFormat({
  day: "numeric",
  month: "short",
  year: "numeric",
});

function clock(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/** Today, yesterday, or neither, by the day the computer is in now. */
function dayOf(date: Date, now: Date) {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dayKey(date) === dayKey(now)) {
    return "today";
  }
  return dayKey(date) === dayKey(yesterday) ? "yesterday" : null;
}

function shortDate(date: Date, now: Date) {
  return (
    date.getFullYear() === now.getFullYear() ? SAME_YEAR : OTHER_YEAR
  ).format(date);
}

/** When a note changed, in its row: "14:10", "Yesterday", "Oct 21", "Oct 21, 2025". */
export function changedShort(updated: string, now: Date) {
  const date = new Date(updated);
  switch (dayOf(date, now)) {
    case "today":
      return clock(date);
    case "yesterday":
      return "Yesterday";
    default:
      return shortDate(date, now);
  }
}

/** When a note changed, in a sentence: "today", "yesterday", "Oct 12", "Oct 12, 2025". */
export function changedOn(updated: string, now: Date) {
  const date = new Date(updated);
  return dayOf(date, now) ?? shortDate(date, now);
}

/** When the open note changed, over it: "Changed today at 14:10", "Changed Oct 12". */
export function changedLong(updated: string, now: Date) {
  const date = new Date(updated);
  const day = dayOf(date, now);
  return day
    ? `Changed ${day} at ${clock(date)}`
    : `Changed ${shortDate(date, now)}`;
}
