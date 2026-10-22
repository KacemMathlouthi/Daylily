import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

/** Where pasted text that reads as markdown landed, so it can be formatted on request. */
export interface MarkdownPaste {
  from: number;
  markdown: string;
  to: number;
}

export interface MarkdownPasteOptions {
  /** Told after markdown is pasted as plain text, with where it went. */
  onPaste: (paste: MarkdownPaste) => void;
}

/** Signs a writer meant markdown: headings, lists, quotes, fences, emphasis, links. */
const MARKDOWN_SIGNS = [
  /^#{1,6}\s/m,
  /^\s*[-*+]\s/m,
  /^\s*\d+[.)]\s/m,
  /^>\s/m,
  /^```/m,
  /\*\*[^*\n]+\*\*/,
  /(^|[^*\w])\*[^*\s][^*\n]*\*(?!\*)/,
  /(^|\s)_[^_\n]+_(\s|$)/,
  /\[[^\]\n]+\]\([^)\s]+\)/,
  /`[^`\n]+`/,
];

export function looksLikeMarkdown(text: string) {
  return MARKDOWN_SIGNS.some((sign) => sign.test(text));
}

const pasteKey = new PluginKey("markdownPaste");

/**
 * Pastes plain text that looks like markdown as it is, then reports it, so the
 * page can offer to apply the formatting. Nothing is reformatted without asking.
 * Rich pastes (from a browser or a word processor) keep their usual handling.
 */
export const MarkdownPaste = Extension.create<MarkdownPasteOptions>({
  addOptions() {
    return { onPaste: () => undefined };
  },

  addProseMirrorPlugins() {
    const { onPaste } = this.options;
    let pasting = false;
    return [
      new Plugin({
        key: pasteKey,
        props: {
          handlePaste(view, event) {
            const text = event.clipboardData?.getData("text/plain") ?? "";
            const hasHtml = Boolean(event.clipboardData?.getData("text/html"));
            if (pasting || hasHtml || !looksLikeMarkdown(text)) {
              return false;
            }
            const { from } = view.state.selection;
            pasting = true;
            try {
              view.pasteText(text);
            } finally {
              pasting = false;
            }
            onPaste({ from, markdown: text, to: view.state.selection.to });
            return true;
          },
        },
      }),
    ];
  },

  name: "markdownPaste",
});
