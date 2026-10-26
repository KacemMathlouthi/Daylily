/**
 * The feature pages, in the order of a day (Paper "v6 · Story and website",
 * "Feature · …"). Each links back to the one before and on to the one after;
 * the last leads to the first, so there's no index to return to.
 */

export type FeatureSlug =
  | "thoughts"
  | "notes"
  | "journaling"
  | "ghost-prompts"
  | "garden"
  | "search";

interface Beat {
  body: string;
  /** What the picture beside it shows, for screen readers. */
  image: string;
  title: string;
}

export interface Feature {
  beats: [Beat, Beat, Beat, Beat];
  /** What the page's own sharing card and search results say. */
  description: string;
  /** The two lines of the headline; the second is set in italic. */
  headline: [string, string];
  /** The hero picture's height at 1440 wide, as exported from Paper. */
  heroHeight: number;
  /** The hero's window, as the app shows it, for screen readers. */
  heroImage: string;
  how: { heading: string; note: string };
  isnt: { heading: string; note: string; lines: [string, string, string] };
  lede: string;
  /** The moment of the day it belongs to. */
  moment: "Through the day" | "In the evening" | "Over the years";
  name: string;
  /** Said on the neighbouring pages' links to this one. */
  oneLine: string;
  slug: FeatureSlug;
}

export const FEATURES: Feature[] = [
  {
    beats: [
      {
        body: "A link you want to read tonight, a door code, a reminder to call the plumber, a recipe you copied, an idea for the weekend. If it’s on your mind, it fits. Each one keeps the time it came.",
        image:
          "Two thoughts under their times: a link to read tonight, and picking up the bread",
        title: "Anything goes.",
      },
      {
        body: "Write, press ⌘ + Enter, and a fresh thought opens at the top, from anywhere on the screen. Today always keeps one waiting for its first word.",
        image: "The keys ⌘ and Enter; Ctrl and Enter on Windows and Linux",
        title: "One key, and the next begins.",
      },
      {
        body: "Thoughts never seal. Tick off the plumber, fix a typo in last week’s idea, or delete a reminder once it’s done. Empty a thought and leave it, and it’s gone.",
        image:
          "A thought from a day whose page has already sealed, still open to change",
        title: "Change it anytime.",
      },
      {
        body: "They’re kept in thoughts.md in the day’s folder, each under its time, pictures beside them. Forgot when you saved that link? Search finds every thought on its own.",
        image:
          "The day’s thoughts.md file, each thought under a line with its time",
        title: "Plain text, easy to find.",
      },
    ],
    description:
      "Write anything down the moment it comes: a link for later, a reminder, a line someone said. Then get back to your day.",
    headline: ["Jot it down.", "The page can wait."],
    heroHeight: 860,
    heroImage:
      "Daylily’s Thoughts screen: thoughts newest first, each under the time it was written",
    how: {
      heading: "Catch it, then carry on.",
      note: "Thoughts sits in the sidebar’s Notebook. Open it whenever something comes to you, write a line or a page, and close it again.",
    },
    isnt: {
      heading: "Not a to-do list.",
      lines: [
        "Folders, tags or due dates. When a list is worth keeping, give it a note.",
        "A written day. Thoughts alone grow no flower; the page is where a day is told.",
        "Something to keep up. Write ten in a day, or none for a week.",
      ],
      note: "Thoughts are for the moment. What you want to keep goes in Notes, and the day itself goes on the page.",
    },
    lede: "Anything that comes to you during the day: a link to read later, something to pick up on the way home, a paragraph you need to paste somewhere safe, a line someone said. Write it down, press ⌘ + Enter, and get back to your day.",
    moment: "Through the day",
    name: "Thoughts",
    oneLine: "Write anything down the moment it comes.",
    slug: "thoughts",
  },
  {
    beats: [
      {
        body: "Your notes are listed beside the one that’s open, the last changed first. Pin the ones you open most to keep them on top, and press + to start a new one.",
        image: "The list of notes, pinned ones on top, beside an open note",
        title: "One list, pinned on top.",
      },
      {
        body: "A note uses the same editor as your daily page: headings, lists, checklists, quotes and images. Tick off a packing list, or change a recipe each time you bake it.",
        image:
          "A note called Lisbon in March, a checklist with one item ticked",
        title: "Write it like the page.",
      },
      {
        body: "Each note is a markdown file in your journal’s notes folder. “Lisbon in March” becomes lisbon-in-march.md, so it opens in any editor, today or in twenty years.",
        image:
          "The file lisbon-in-march.md, its title and dates, then the note",
        title: "A plain file, named from its title.",
      },
      {
        body: "When a list has done its job, choose Move to Trash from the ⋯ menu. The file goes to your computer’s Trash, where you can restore it. Daylily never removes a note on its own.",
        image: "A note’s menu open, with Move to Trash",
        title: "To the Trash, when you’re done.",
      },
    ],
    description:
      "Books to read, gift ideas, a recipe you keep adjusting: the pages you keep and change, at the back of your journal.",
    headline: ["Pages without a date.", "Kept at the back."],
    heroHeight: 860,
    heroImage:
      "Daylily’s Notes screen: the list of notes beside an open note, Books to read",
    how: {
      heading: "Pages you come back to.",
      note: "Notes sits in the sidebar’s Notebook, under Thoughts. Search finds them too, beside your days and thoughts.",
    },
    isnt: {
      heading: "Not a knowledge base.",
      lines: [
        "Folders, tags or links between notes. The folder opens in Obsidian for that.",
        "Sealed, or a flower. A note has no date, so it never seals and grows nothing in the garden.",
        "Your daily page. What happened today still goes on today’s page.",
      ],
      note: "Notes are the few pages you keep coming back to. Your day still belongs on its page, in the evening, in your own words.",
    },
    lede: "Books to read, gift ideas, a recipe you keep adjusting, plans for a trip, questions for the doctor. Notes are the back pages of your journal: pages you keep and change as often as you like.",
    moment: "Through the day",
    name: "Notes",
    oneLine: "The back pages: lists and plans you keep and change.",
    slug: "notes",
  },
  {
    beats: [
      {
        body: "Open Today and the cursor is already waiting under “How was your day?”. Give the day a title and write, with lists, quotes and images pasted or dropped in. Every change is saved half a second later.",
        image: "A blank page asking How was your day?",
        title: "It asks how your day was.",
      },
      {
        body: "Pick a painting from Daylily’s gallery, or a photo of your own. The cover is how the day shows in your calendar, and it gives the day’s flower its colour.",
        image: "The cover picker, with paintings from the gallery",
        title: "One cover for the day.",
      },
      {
        body: "A day runs from 4am to 4am, so writing at 1am still counts as today. Then the page seals as you wrote it and a fresh one opens. A day sealed without a cover gets one from the gallery.",
        image: "Yesterday’s page, sealed just now, beside today’s blank one",
        title: "Sealed at 4am, like ink.",
      },
      {
        body: "Open any day from the calendar, the garden or Home, and step through them with ‹ › or the arrow keys. A missed day is bare soil, never a reproach. A day changed in another app says so, quietly.",
        image: "A sealed day, Evening walk, with its seal time",
        title: "Past days, kept to read.",
      },
    ],
    description:
      "One page a day, in your own words. It asks how your day was, saves as you go, and seals at 4am like ink.",
    headline: ["One page a day.", "In your own words."],
    heroHeight: 860,
    heroImage:
      "Daylily’s writing screen: today’s page, The long way home, under a cover of daylilies",
    how: {
      heading: "Write today. Read the rest.",
      note: "Today sits at the top of the sidebar’s Journal: the only page you can write. Pause, and a quiet question may fade in. That’s ghost prompts, next.",
    },
    isnt: {
      heading: "Not a ghostwriter.",
      lines: [
        "AI that writes, rewrites or fixes your grammar. Every word is yours.",
        "Streaks or guilt. Miss a week and the door is still open.",
        "Going back to rewrite yesterday. Once sealed, a day stays as you wrote it.",
      ],
      note: "Daylily is there to draw your words out, never to put words in. Broken grammar and unfinished thoughts count, because they’re true.",
    },
    lede: "Every evening Daylily opens on today’s page and asks how your day was. Give it a title and a cover, write what happened and how it felt, and it saves as you go. At 4am the page seals as you wrote it, like ink.",
    moment: "In the evening",
    name: "Journaling",
    oneLine: "One page a day, in your own words, sealed at 4am.",
    slug: "journaling",
  },
  {
    beats: [
      {
        body: "After about six seconds without typing, on a page that has words, one question fades in at the cursor in a faint colour. Only at the end of a line, so it never covers what you wrote.",
        image: "A page with a faint question after the last line",
        title: "Only when you pause.",
      },
      {
        body: "Any key sends it away. You can’t tab it in, click it in or accept it. Your page only ever holds the words you typed.",
        image: "The question showing while paused, then gone as you type",
        title: "Gone the moment you type.",
      },
      {
        body: "A small set of questions, picked at random and never the same twice in a row. At most one each time you pause.",
        image: "The set of questions, one of them chosen for this pause",
        title: "Never twice in a row.",
      },
      {
        body: "Choose when you first open Daylily, and change your mind any time in Settings, under Writing & sealing. Off, the page stays perfectly quiet.",
        image: "Settings, Writing & sealing, with Ghost prompts switched on",
        title: "Yours to turn off.",
      },
    ],
    description:
      "When you pause, a quiet question fades in where you stopped. It’s a question, never a sentence you can accept.",
    headline: ["A quiet question,", "when you pause."],
    heroHeight: 740,
    heroImage:
      "Today’s page with a faint question after the last line: …and how did that feel?",
    how: {
      heading: "It draws more out of you.",
      note: "The page opens on “How was your day?” with the cursor in place. Ghost prompts help with what comes after.",
    },
    isnt: {
      heading: "Questions, never sentences.",
      lines: [
        "Autocomplete. There is nothing to tab into your page.",
        "A rewrite, a summary or a grammar fix. Typos count, because they’re true.",
        "A chat. It asks once, then waits for you.",
      ],
      note: "Today they come from a small set, picked at random. When questions start listening, only if you turn it on, they’ll still never write a word for you.",
    },
    lede: "Stop typing for a moment and a faint line fades in where you stopped: …and how did that feel? It’s a question, never a sentence you can accept. The moment you type, it’s gone.",
    moment: "In the evening",
    name: "Ghost prompts",
    oneLine: "A quiet question when you pause.",
    slug: "ghost-prompts",
  },
  {
    beats: [
      {
        body: "Write today’s page and a flower opens in the garden. The more you wrote, the bigger it grows, and its colour comes from the day’s cover. Thoughts alone grow none: the page is what counts.",
        image: "Three covers, each above its flower, small, medium and large",
        title: "One page, one flower.",
      },
      {
        body: "The calendar shows a month at a time, each day with its cover and title, so looking back feels like a photo album. Move with the arrows, and click any day to read it as it was sealed.",
        image:
          "Two weeks of the calendar, covers and titles, a few resting days",
        title: "A month of covers.",
      },
      {
        body: "A day you didn’t write is bare soil, marked resting. Days before your first page aren’t missed at all, just plain ground. Come back after a week or a year and the next flower opens the same.",
        image: "This week on Home, two days resting and today",
        title: "Bare soil, never wilting.",
      },
      {
        body: "Save as image makes a square card of your year: your name, its flowers, three numbers and the meadow. It’s saved to your computer and goes nowhere unless you send it.",
        image: "The Save as image button and the square card of a year",
        title: "A card, if you want one.",
      },
    ],
    description:
      "Every day you write plants a flower, and the calendar keeps each day’s cover and title, like a photo album.",
    headline: ["Write a day.", "Grow a garden."],
    heroHeight: 860,
    heroImage: "Daylily’s garden: a year of flowers, one for every day written",
    how: {
      heading: "A year, one flower at a time.",
      note: "One year at a time, with the years you wrote beside it, like a GitHub profile. Garden and Calendar sit in the sidebar’s Journal, and Home shows this week.",
    },
    isnt: {
      heading: "Not a score to keep.",
      lines: [
        "Streaks, or a count of the days you missed.",
        "Wilting. A missed day is bare soil, and the door stays open.",
        "A public profile. The card is an image you save, and send only if you like.",
      ],
      note: "The garden is a picture of the days you wrote, not a target. Write when you want to; it waits for you.",
    },
    lede: "Every page you write plants a flower: bigger when you wrote more, coloured by the day’s cover. A day you skip is bare soil. Months later the garden is a picture of your year, and the calendar keeps every day’s cover and title, like a photo album.",
    moment: "Over the years",
    name: "Garden and calendar",
    oneLine: "Every day you write becomes a flower.",
    slug: "garden",
  },
  {
    beats: [
      {
        body: "Press ⌘ + K, or Ctrl + K on Windows and Linux, on any screen, even mid-sentence. Or click Search at the top of the sidebar. Esc puts it away.",
        image: "The keys ⌘ and K; Ctrl and K on Windows and Linux",
        title: "Two keys, from anywhere.",
      },
      {
        body: "Days, thoughts and notes come up together as you type, and the one you’ve chosen opens beside the list. A word in a title ranks above one in the page. ⌘ + J hides the preview.",
        image:
          "Search results for the sea, the chosen day previewed beside them",
        title: "One list, best match first.",
      },
      {
        body: "“Walk” finds walked and walking. Accents and capitals don’t matter, so cafe finds Café. Get a letter wrong in a longer word and it still finds what you meant.",
        image:
          "What you type and what it finds: walk finds walked, cafe finds Café, brekfast finds breakfast",
        title: "Forgiving, like a friend.",
      },
      {
        body: "Enter opens the day, thought or note right where the words are. They glow for a moment, then fade, and you’re reading.",
        image: "A day opened at the words searched for, glowing",
        title: "Opened at the words.",
      },
    ],
    description:
      "Press ⌘ + K and type a word: days, thoughts and notes in one list, best match first, all on your own computer.",
    headline: ["Type a word.", "The day comes back."],
    heroHeight: 860,
    heroImage:
      "Daylily’s search: a note, a thought and a day found for lemon, the note previewed beside them",
    how: {
      heading: "Find it the way you remember it.",
      note: "Search sits at the top of the sidebar, and in Edit › Search. It looks through every page, thought and note you’ve kept, as far back as they go.",
    },
    isnt: {
      heading: "Kept to yourself.",
      lines: [
        "Sent anywhere. It all happens on your computer, even offline.",
        "Ads, trends or suggestions. It shows what you wrote, and nothing else.",
        "An AI answering for you. It finds your own words and leaves them as they are.",
      ],
      note: "Search reads the journal folder on your own computer. It works offline, and what you look for stays between you and your pages.",
    },
    lede: "That café in Lisbon, what Sam said, the book you couldn’t put down. Press ⌘ + K and start typing: days, thoughts and notes come up in one list, best match first, all on your own computer.",
    moment: "Over the years",
    name: "Search",
    oneLine: "Find any word, in any day, thought or note.",
    slug: "search",
  },
];

/** A feature and the ones before and after it, the ends joined into a loop. */
export function featureAndNeighbours(slug: FeatureSlug) {
  const index = FEATURES.findIndex((each) => each.slug === slug);
  const at = (offset: number) =>
    FEATURES[(index + offset + FEATURES.length) % FEATURES.length];
  const feature = FEATURES[index];
  const previous = at(-1);
  const next = at(1);
  if (!(feature && previous && next)) {
    throw new Error(`No feature page for ${slug}`);
  }
  return { feature, next, previous };
}
