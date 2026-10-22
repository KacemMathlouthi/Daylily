import type { DayKey } from "../lib/month";
import type { MockDay } from "./journal";

/** The words of the days Paper quotes, as their files would hold them. */
const QUOTED: Record<DayKey, string> = {
  "2026-10-18":
    "Went out after dinner because the house felt too small. The sky over the hills did that thing where it turns peach and then pink and you keep thinking it’s done and it isn’t.\n\nI’m worried about the job thing more than I’m admitting. Writing it down helps a bit. Tomorrow I’ll just ask.",
  "2026-10-20":
    "I took the long way home today. Nothing dramatic, just the turn by the park instead of the station. The daylilies along the fence were still open even though the light was going.\n\nCalled Sam on the walk. We talked about almost nothing, her noisy neighbour, a book neither of us has finished. I think I needed that more than advice.\n\nWhen I got home the kitchen was dark and quiet.",
};

/** Sample paragraphs for the grown days, so each sealed page has something to read. */
const PARAGRAPHS = [
  "Slow start. Coffee by the window while the street woke up, and for once I didn’t reach for my phone first.",
  "Work was fine. A long meeting that could have been a note, then two good hours where everything clicked.",
  "Walked home the long way. The light at that hour makes everything look like it’s remembering something.",
  "Mum called. We talked about the garden and her knee and nothing at all, which is my favourite kind of call.",
  "I keep meaning to write more here and then the day is over. Today I’m just glad I sat down.",
  "Cooked properly for the first time in a week. Onions, garlic, whatever was left. It tasted like being home.",
  "Tired in the good way. Legs heavy from the hill, head quiet.",
  "Small win: finally fixed the shelf. Small loss: the plant on it did not survive the process.",
  "Read on the bus and missed my stop by two. Didn’t mind.",
  "Rain all afternoon. I let it be the excuse to do very little, and it was exactly right.",
];

/** A stable number for a day, so its sample page reads the same every time. */
function seedOf(key: DayKey) {
  let seed = 0;
  for (const char of key) {
    seed = (seed * 31 + char.charCodeAt(0)) % 9973;
  }
  return seed;
}

/** A sealed day's page as markdown: Paper's words where it has them, sample ones elsewhere. */
export function mockPage(key: DayKey, day: MockDay): string {
  const quoted = QUOTED[key];
  if (quoted) {
    return quoted;
  }
  const seed = seedOf(key);
  const count = 2 + (seed % 2);
  const picked = Array.from(
    { length: count },
    (_, index) => PARAGRAPHS[(seed + index * 3) % PARAGRAPHS.length] ?? ""
  );
  return [day.excerpt, ...picked].filter(Boolean).join("\n\n");
}
