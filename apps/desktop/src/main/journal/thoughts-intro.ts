import type { Thought } from "@daylily/core/thoughts-file";

/**
 * The Thoughts screen's own two notes, given once to every journal: written as
 * real thoughts, so they can be changed or deleted like any other. The second
 * is the newer, so it's read first.
 */
export function introductionThoughts(
  platform: string,
  time: string
): Thought[] {
  const next = platform === "darwin" ? "⌘ Enter" : "Ctrl Enter";
  return [
    {
      body: [
        "**Not a notes app, and not a second page.**",
        "Your page is where you make sense of the day. At 4am it seals and stays as you wrote it. Thoughts are what comes before that, so they stay open.",
        "There are no folders, tags or links to look after. Just the time, and what was on your mind.",
        "They’re kept beside each day’s page, in `thoughts.md`, plain text you can open anywhere. Delete these two whenever you like.",
      ].join("\n\n"),
      time,
    },
    {
      body: [
        "**Thoughts are for the middle of the day.**",
        "Your page asks how the day was, once, in the evening. Thoughts catch what happens before that: something someone said, an idea on the way somewhere, a worry at two in the afternoon.",
        [
          `- Write one, press ${next}, and the next one begins.`,
          "- Each keeps the time you started it.",
          "- Pictures, lists and quotes work here, as on the page.",
          "- Come back and change any of them, any day.",
        ].join("\n"),
      ].join("\n\n"),
      time,
    },
  ];
}
