import { countWords } from "@daylily/ui/editor/extensions";
import type { DayKey } from "../lib/month";
import type { MockDay } from "./journal";

/** The words of the days Paper quotes, as their files would hold them. */
const QUOTED: Record<DayKey, string> = {
  "2026-10-18":
    "Went out after dinner because the house felt too small. The sky over the hills did that thing where it turns peach and then pink and you keep thinking it’s done and it isn’t.\n\nI’m worried about the job thing more than I’m admitting. Writing it down helps a bit. Tomorrow I’ll just ask.",
  "2026-10-20":
    "I took the long way home today. Nothing dramatic, just the turn by the park instead of the station. The daylilies along the fence were still open even though the light was going.\n\nCalled Sam on the walk. We talked about almost nothing, her noisy neighbour, a book neither of us has finished. I think I needed that more than advice.\n\nWhen I got home the kitchen was dark and quiet.",
};

/**
 * Sample paragraphs for the grown days, enough that even the longest sample page
 * never repeats one.
 */
const PARAGRAPHS = [
  "Slow start. Coffee by the window while the street woke up, and for once I didn’t reach for my phone first. The radiator ticked. Somebody downstairs was singing badly and happily.",
  "Work was fine. A long meeting that could have been a note, then two good hours where everything clicked and I forgot to check the time. I want more afternoons like that one.",
  "Walked home the long way. The light at that hour makes everything look like it’s remembering something, the brick walls, the bikes chained to the railings, even the bins.",
  "Mum called. We talked about the garden and her knee and nothing at all, which is my favourite kind of call. She laughed at her own joke before finishing it, the way she always does.",
  "I keep meaning to write more here and then the day is over. Today I’m just glad I sat down, even if it’s only these few lines before bed.",
  "Cooked properly for the first time in a week. Onions, garlic, whatever was left in the fridge, a little too much chilli. It tasted like being home, and I ate it standing at the counter.",
  "Tired in the good way. Legs heavy from the hill, head quiet. I think the walk did more for me than the whole weekend of resting did.",
  "Small win: finally fixed the shelf. Small loss: the plant on it did not survive the process. I’m choosing to count the day as a draw.",
  "Read on the bus and missed my stop by two. Didn’t mind. Walked back through the market and bought pears I didn’t need because they smelled so good.",
  "Rain all afternoon. I let it be the excuse to do very little, and it was exactly right. Tea, a blanket, the window fogging up, the sound of it on the roof.",
  "Had a hard conversation I’d been putting off. It went better than the version in my head, which is almost always true and which I almost never remember beforehand.",
  "The neighbour’s cat sat on my step again this morning like it pays rent. I gave in and said good morning to it. It ignored me, which felt fair.",
  "Noticed the trees on our street are turning, one at a time, as if they’re taking turns. The one by the corner is completely gold already and the rest are still deciding.",
  "Couldn’t focus at all today. Started six things and finished none of them. I’m trying not to make that mean anything bigger than it is. Some days are just like that.",
  "Lunch outside with Sam. We split a sandwich and talked about moving somewhere with a garden, which we say every autumn and never do. Still, it was nice to say it again.",
  "Found an old notebook from years ago at the back of the drawer. Half embarrassing, half sweet. I used to worry about the same things, just with different names on them.",
  "The train was late and packed, and a stranger gave up her seat for an old man without anyone asking. Such a small thing. It stayed with me all day.",
  "Went to bed too late again. I know exactly why and I keep doing it anyway, one more chapter, one more video, one more scroll. Tonight I’m putting the phone in the other room.",
  "Sunday market. Bought flowers for no reason, orange ones, and they make the whole kitchen feel brighter. I keep looking at them while I wash up.",
  "A quiet day. Nothing happened and that was the best part. I sorted the laundry, answered two letters, and sat on the step for a while watching the street.",
  "Got good news about the project. I didn’t celebrate, I just went for a walk and let myself feel it properly for once instead of rushing on to the next worry.",
  "Missed home a bit today. The smell of something baking in the street did it. I’ll call tomorrow, and maybe plan a visit before the year runs out.",
  "Tried the new recipe. It did not look like the picture. It tasted fine. I’m learning to be fine with fine, which is maybe the real recipe here.",
  "Long day, short patience. I snapped at someone who didn’t deserve it and apologised an hour later. I want to be quicker at the second part.",
  "Watched the sunset from the bridge on the way home. A few other people stopped too. Nobody said anything, we just stood there until it was gone.",
  "Cleared out the hallway cupboard and found three umbrellas I thought I’d lost. It has rained every day for a week. Of course they were here the whole time.",
  "Spent the evening fixing the bike. Oil on my hands, radio on, the window open to the cold. It felt good to make something work again with my own hands.",
  "Felt low this morning for no reason I can name. By the afternoon it had passed, like weather. Writing it here so I remember that it does pass.",
  "Ran into an old friend at the shop. We stood in the cereal aisle for twenty minutes catching up and promised to get coffee. I hope we actually do.",
  "Planted the bulbs at last, a whole tray of them, in the cold soil by the fence. Something to look forward to in spring. Future me will be glad of this.",
  "Late night, the house asleep, just the lamp and the sound of the fridge. These are the hours I like best, when nobody needs anything from me.",
  "Today was ordinary in every way, and I want to remember that ordinary is good. Breakfast, work, a walk, dinner, this page. That’s a whole life, really.",
];

const TRAILING_MARK = /[,;:]$/;

/** A stable number for a day, so its sample page reads the same every time. */
function seedOf(key: DayKey) {
  let seed = 0;
  for (const char of key) {
    seed = (seed * 31 + char.charCodeAt(0)) % 9973;
  }
  return seed;
}

/**
 * Sample paragraphs, never repeating, cut to exactly `target` words so the page
 * matches the length the garden and calendar show for it.
 */
function grownPage(key: DayKey, target: number, opening: string | undefined) {
  const seed = seedOf(key);
  const paragraphs: string[] = opening ? [opening] : [];
  let words = opening ? countWords(opening) : 0;
  for (let index = 0; words < target && index < PARAGRAPHS.length; index += 1) {
    const paragraph = PARAGRAPHS[(seed + index * 7) % PARAGRAPHS.length] ?? "";
    paragraphs.push(paragraph);
    words += countWords(paragraph);
  }
  // The last paragraph usually runs over; trim it back to the day's length
  const last = paragraphs.pop() ?? "";
  const kept = countWords(paragraphs.join(" "));
  const tokens = last.split(" ");
  while (tokens.length > 0 && kept + countWords(tokens.join(" ")) > target) {
    tokens.pop();
  }
  const ending = tokens.join(" ").replace(TRAILING_MARK, "");
  return [...paragraphs, ending && `${ending}…`].filter(Boolean).join("\n\n");
}

/** A sealed day's page as markdown: Paper's words where it has them, sample ones elsewhere. */
export function mockPage(key: DayKey, day: MockDay): string {
  return QUOTED[key] ?? grownPage(key, day.words, day.excerpt);
}
