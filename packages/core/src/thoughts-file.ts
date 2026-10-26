import { type DayFileError, readDayFile, rewriteFile } from "./day-file";
import { ok, type Result } from "./result";
import { isoWithOffset, wallTime } from "./zone";

/**
 * One thought: when it was begun, on the clock where it was written, and its
 * words as markdown. Text before a day's first thought, written by hand in
 * another app, has no time and is kept as it is.
 */
export interface Thought {
  body: string;
  /** `HH:MM`, or null for text that came before the first time. */
  time: string | null;
}

/** The name of a day's thoughts, beside its page. */
export const THOUGHTS_FILE = "thoughts.md";

/** A line that begins a thought: `## 14:10` and nothing more. */
const THOUGHT_HEADING = /^##[ \t]+([01]\d|2[0-3]):([0-5]\d)[ \t]*$/;
/** A fence opening or closing a code block, where a heading is only text. */
const FENCE = /^[ \t]{0,3}(`{3,}|~{3,})/;
const LINE_BREAK = /\r?\n/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Whether `text` is a time a thought can begin at, `HH:MM`. */
export function isThoughtTime(text: string) {
  return TIME.test(text);
}

/** The time a thought begun at `instant` shows, on the clock in `zone`. */
export function thoughtTime(instant: Date, zone: string) {
  const { hour, minute } = wallTime(instant, zone);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Splits a day's thoughts at their headings; a heading inside a code block stays text. */
function splitThoughts(body: string): Thought[] {
  const thoughts: Thought[] = [];
  let current: { time: string | null; lines: string[] } = {
    lines: [],
    time: null,
  };
  let fence: string | null = null;
  const finish = () => {
    const text = current.lines.join("\n").trim();
    // Untimed text is kept only when there is some; a timed thought always is
    if (current.time !== null || text !== "") {
      thoughts.push({ body: text, time: current.time });
    }
  };

  for (const line of body.split(LINE_BREAK)) {
    const fenceMark = FENCE.exec(line)?.[1];
    if (fenceMark) {
      if (fence === null) {
        fence = fenceMark;
      } else if (
        fenceMark[0] === fence[0] &&
        fenceMark.length >= fence.length
      ) {
        fence = null;
      }
    }
    const heading = fence === null ? THOUGHT_HEADING.exec(line) : null;
    if (heading) {
      finish();
      current = { lines: [], time: `${heading[1]}:${heading[2]}` };
    } else {
      current.lines.push(line);
    }
  }
  finish();
  return thoughts;
}

/** Reads a day's thoughts file, in the order they were written. */
export function readThoughtsFile(
  text: string
): Result<Thought[], DayFileError> {
  const file = readDayFile(text);
  return file.ok ? ok(splitThoughts(file.value.body)) : file;
}

export interface ThoughtsStamp {
  /** Who wrote it, like `daylily/0.7.0`. */
  app: string;
  now: Date;
  /** The device's current zone. */
  timeZone: string;
}

/**
 * A day's thoughts file after a save, in the order given: each under its time,
 * blank ones left out. Fields other tools added, and text before the first
 * thought, are kept. `existing` is the file as it is on disk, or null for none.
 */
export function writeThoughtsFile(
  existing: string | null,
  thoughts: readonly Thought[],
  stamp: ThoughtsStamp
): Result<string, DayFileError> {
  let tz: string | null = null;
  let created: string | null = null;
  if (existing !== null) {
    const file = readDayFile(existing);
    if (!file.ok) {
      return file;
    }
    ({ tz, created } = file.value.meta);
  }
  const body = thoughts
    .map((thought) => ({ ...thought, body: thought.body.trim() }))
    .filter((thought) => thought.time === null || thought.body !== "")
    .map(({ body: words, time }) =>
      time === null ? words : `## ${time}\n\n${words}`
    )
    .filter((block) => block !== "")
    .join("\n\n");
  const now = isoWithOffset(stamp.now, stamp.timeZone);
  return rewriteFile(
    existing ?? "",
    {
      app: stamp.app,
      created: created ?? now,
      // Where the day's thoughts were first written, as for its page
      tz: tz ?? stamp.timeZone,
      updated: now,
    },
    body
  );
}
