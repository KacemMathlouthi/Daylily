import { matchRanges } from "@daylily/core/search-text";
import { Extension } from "@tiptap/core";
import type { Node } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

/** How the words show: marked while choosing a result, or a glow that fades once the day opens. */
export type SearchHighlightStyle = "mark" | "glow";

interface Highlight {
  query: string;
  style: SearchHighlightStyle;
}

interface HighlightState extends Highlight {
  /** Worked out once per page and highlight, not on every keystroke or click. */
  marks: DecorationSet;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    searchHighlight: {
      /** Marks the words of `query` on the page; an empty query clears them. */
      setSearchHighlight: (
        query: string,
        style?: SearchHighlightStyle
      ) => ReturnType;
    };
  }
}

const highlightKey = new PluginKey<HighlightState>("searchHighlight");

/** Stands in for anything in a line that isn't text, an image say, so offsets stay positions. */
const NOT_TEXT = "￼";

function decorations(doc: Node, { query, style }: Highlight) {
  if (query.trim() === "") {
    return DecorationSet.empty;
  }
  const className =
    style === "glow" ? "search-match search-match-glow" : "search-match";
  const found: Decoration[] = [];
  doc.descendants((block, pos) => {
    if (!block.isTextblock) {
      return true;
    }
    let text = "";
    for (let index = 0; index < block.childCount; index += 1) {
      const child = block.child(index);
      text += child.isText
        ? (child.text ?? "")
        : NOT_TEXT.repeat(child.nodeSize);
    }
    for (const [start, end] of matchRanges(text, query)) {
      found.push(
        Decoration.inline(pos + 1 + start, pos + 1 + end, { class: className })
      );
    }
    return false;
  });
  return DecorationSet.create(doc, found);
}

/**
 * Marks what was searched for on a page. Decorations only: the page itself never
 * changes, so it's safe on today's page while writing. The first match carries
 * `.search-match`, for scrolling to it.
 */
export const SearchHighlight = Extension.create({
  addCommands() {
    return {
      setSearchHighlight:
        (query, style = "mark") =>
        ({ tr, dispatch }) => {
          dispatch?.(tr.setMeta(highlightKey, { query, style }));
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<HighlightState>({
        key: highlightKey,
        props: {
          decorations: (state) => highlightKey.getState(state)?.marks ?? null,
        },
        state: {
          apply(tr, current) {
            const asked = tr.getMeta(highlightKey) as Highlight | undefined;
            if (asked) {
              return { ...asked, marks: decorations(tr.doc, asked) };
            }
            // Writing while words are marked: only then is the page looked through again
            return tr.docChanged && current.query !== ""
              ? { ...current, marks: decorations(tr.doc, current) }
              : current;
          },
          init: () => ({
            marks: DecorationSet.empty,
            query: "",
            style: "mark",
          }),
        },
      }),
    ];
  },

  name: "searchHighlight",
});
