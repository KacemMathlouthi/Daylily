import { type AnyExtension, Extension } from "@tiptap/core";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { StarterKit } from "@tiptap/starter-kit";
import { GhostPrompts, type GhostPromptsOptions } from "./ghost-prompts";

/** Enter on an empty last line of a quote steps out of it, as it does in a list. */
const QuoteExit = Extension.create({
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { $from, empty } = editor.state.selection;
        const quote = $from.node(-1);
        const isEmptyLastLine =
          empty &&
          quote?.type.name === "blockquote" &&
          $from.parent.content.size === 0 &&
          $from.index(-1) === quote.childCount - 1;
        return isEmptyLastLine && editor.commands.lift("blockquote");
      },
    };
  },
  name: "quoteExit",
});

export interface PageExtensionsOptions {
  /** Nudges while writing; leave out for pages that are only read. */
  ghostPrompts?: Partial<GhostPromptsOptions>;
  /** Faint text on an empty page, such as "How was your day?". */
  placeholder?: string;
}

/**
 * What a journal page can hold: the markdown a person would write by hand, and
 * nothing that wouldn't survive being opened in another editor. Pages read and
 * write CommonMark through the Markdown extension.
 */
export function pageExtensions({
  placeholder,
  ghostPrompts,
}: PageExtensionsOptions = {}): AnyExtension[] {
  const extensions: AnyExtension[] = [
    StarterKit.configure({
      code: false,
      codeBlock: false,
      heading: { levels: [2, 3] },
      // Links would navigate the app window; they come back with a safe opener
      link: false,
      // Not markdown, so it wouldn't survive the file
      underline: false,
    }),
    Markdown,
    QuoteExit,
  ];
  if (placeholder) {
    extensions.push(Placeholder.configure({ placeholder }));
  }
  if (ghostPrompts) {
    extensions.push(GhostPrompts.configure(ghostPrompts));
  }
  return extensions;
}

const WORD = /\p{L}|\p{N}/u;
const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });

/** Words as a reader would count them, in any script (Japanese has no spaces). */
export function countWords(text: string) {
  let words = 0;
  for (const segment of segmenter.segment(text)) {
    if (segment.isWordLike && WORD.test(segment.segment)) {
      words += 1;
    }
  }
  return words;
}
