import { type AnyExtension, Extension } from "@tiptap/core";
import { Code } from "@tiptap/extension-code";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { StarterKit } from "@tiptap/starter-kit";
import { CodeBlock } from "./code-block";
import { GhostPrompts, type GhostPromptsOptions } from "./ghost-prompts";
import { MarkdownPaste, type MarkdownPasteOptions } from "./markdown-paste";
import { SearchHighlight } from "./search-highlight";

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
  /** Offers to format pasted markdown; leave out for pages that are only read. */
  markdownPaste?: MarkdownPasteOptions;
  /** Faint text on an empty page, such as "How was your day?". */
  placeholder?: string;
}

/**
 * Inline code that sits inside bold or italic, as markdown allows (**`like
 * this`**). Tiptap's own excludes every other mark, which rejects such pages.
 */
const InlineCode = Code.extend({ excludes: "" });

/** Links that are safe to hand to the system browser. */
const SAFE_LINK = /^(https?:\/\/|mailto:)/i;

/**
 * What a journal page can hold: the markdown a person would write by hand, and
 * nothing that wouldn't survive being opened in another editor. Pages read and
 * write CommonMark through the Markdown extension.
 */
export function pageExtensions({
  placeholder,
  ghostPrompts,
  markdownPaste,
}: PageExtensionsOptions = {}): AnyExtension[] {
  const extensions: AnyExtension[] = [
    StarterKit.configure({
      // Both replaced below: code that can be bold, and a highlighted code block
      code: false,
      codeBlock: false,
      heading: { levels: [2, 3] },
      // Clicks open in the system browser: the app's window handler sends them there
      link: {
        autolink: true,
        isAllowedUri: (url) => SAFE_LINK.test(url),
        openOnClick: true,
      },
      // Not markdown, so it wouldn't survive the file
      underline: false,
    }),
    InlineCode,
    CodeBlock,
    TableKit.configure({ table: { resizable: false } }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Markdown,
    QuoteExit,
    SearchHighlight,
  ];
  if (placeholder) {
    extensions.push(Placeholder.configure({ placeholder }));
  }
  if (markdownPaste) {
    extensions.push(MarkdownPaste.configure(markdownPaste));
  }
  if (ghostPrompts) {
    extensions.push(GhostPrompts.configure(ghostPrompts));
  }
  return extensions;
}
