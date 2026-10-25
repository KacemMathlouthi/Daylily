import { Image } from "@tiptap/extension-image";
import type { Node as PmNode } from "@tiptap/pm/model";
import {
  type EditorState,
  Plugin,
  PluginKey,
  TextSelection,
} from "@tiptap/pm/state";
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { PageImageView } from "./page-image-view";

export interface PageImageOptions {
  /**
   * Copies a pasted or dropped file into the day's folder and returns the name
   * the page links to, or null when it was refused (the page says why). Leave
   * out for pages that are only read.
   */
  add?: (file: File) => Promise<string | null>;
  /**
   * Where an image on the page loads from, or null when it can't be shown.
   * Daylily never loads anything from the web, so web addresses come back null.
   */
  resolve: (src: string) => string | null;
}

/** A markdown image address that needs `<…>` to survive: spaces, brackets, parentheses. */
const NEEDS_ANGLES = /[\s()<>]/;
const ALT_SPECIAL = /[\\[\]]/g;
const TITLE_QUOTE = /"/g;

/** An image as markdown, escaped so any address or description reads back the same. */
export function imageMarkdown({
  alt,
  src,
  title,
}: {
  alt: string | null;
  src: string | null;
  title: string | null;
}) {
  const address = src ?? "";
  const target = NEEDS_ANGLES.test(address) ? `<${address}>` : address;
  const text = (alt ?? "").replace(ALT_SPECIAL, "\\$&");
  const titled = title ? ` "${title.replace(TITLE_QUOTE, '\\"')}"` : "";
  return `![${text}](${target}${titled})`;
}

interface DropState {
  /** The block the dragged file would land before, or after when `after`. */
  line: { pos: number; after: boolean } | null;
  /** Where each image still being copied goes, kept in place as the page changes. */
  pending: Map<number, number>;
}

type DropMeta =
  | { kind: "line"; line: DropState["line"] }
  | { kind: "pending"; id: number; pos: number | null };

const dropKey = new PluginKey<DropState>("pageImageDrop");

/** Whether a drag or paste carries files rather than text. */
function carriesFiles(data: DataTransfer | null) {
  return data?.types.includes("Files") ?? false;
}

/**
 * The gap between the page's top-level blocks nearest a point: before the block
 * under it when in its top half, after it otherwise. Images go between blocks,
 * never into the middle of a sentence.
 */
function boundaryAt(view: EditorView, x: number, y: number) {
  const { doc } = view.state;
  const hit = view.posAtCoords({ left: x, top: y });
  if (!hit || doc.childCount === 0) {
    return { after: true, pos: Math.max(0, doc.content.size - 1) };
  }
  const $pos = doc.resolve(Math.min(hit.pos, doc.content.size));
  const index = Math.min($pos.index(0), doc.childCount - 1);
  let start = 0;
  for (let i = 0; i < index; i += 1) {
    start += doc.child(i).nodeSize;
  }
  const dom = view.nodeDOM(start);
  const rect = dom instanceof HTMLElement ? dom.getBoundingClientRect() : null;
  const after = rect ? y > rect.top + rect.height / 2 : true;
  return { after, pos: start };
}

/** The position just past the top-level block at `pos`, or before it. */
function sideOf(doc: PmNode, line: { pos: number; after: boolean }) {
  const block = doc.nodeAt(line.pos);
  return line.after && block ? line.pos + block.nodeSize : line.pos;
}

/** The top-level block holding the selection, as a drop line after it. */
function afterSelection(state: EditorState) {
  const { $from } = state.selection;
  if ($from.depth === 0) {
    return state.selection.from;
  }
  const start = $from.before(1);
  const block = state.doc.nodeAt(start);
  // An empty paragraph is where the image goes, rather than after it
  if (block?.type.name === "paragraph" && block.content.size === 0) {
    return start;
  }
  return $from.after(1);
}

let nextId = 0;

/**
 * Copies files in, one by one and in order, each into its own paragraph at `at`
 * (kept in place while the copy is on its way), and leaves the cursor after the
 * last so writing can go on.
 */
async function addFiles(
  view: EditorView,
  files: File[],
  at: number,
  add: (file: File) => Promise<string | null>
) {
  const id = nextId;
  nextId += 1;
  view.dispatch(
    view.state.tr.setMeta(dropKey, { id, kind: "pending", pos: at })
  );
  try {
    for (const file of files) {
      // In order: the second image goes after the first
      // biome-ignore lint/performance/noAwaitInLoops: each copy is placed after the one before
      const name = await add(file);
      const pos = dropKey.getState(view.state)?.pending.get(id);
      if (name === null || pos === undefined || view.isDestroyed) {
        continue;
      }
      const { schema, tr } = view.state;
      const { image: imageType, paragraph } = schema.nodes;
      const image = imageType?.create({ src: name });
      if (!(image && paragraph)) {
        return;
      }
      const block = tr.doc.nodeAt(pos);
      const placed = paragraph.create(null, image);
      if (block?.type === paragraph && block.content.size === 0) {
        tr.replaceWith(pos, pos + block.nodeSize, placed);
      } else {
        tr.insert(pos, placed);
      }
      const after = pos + placed.nodeSize;
      if (after >= tr.doc.content.size) {
        tr.insert(after, paragraph.create());
      }
      tr.setSelection(TextSelection.near(tr.doc.resolve(after + 1)));
      tr.setMeta(dropKey, { id, kind: "pending", pos: after });
      view.dispatch(tr.scrollIntoView());
    }
  } finally {
    if (!view.isDestroyed) {
      view.dispatch(
        view.state.tr.setMeta(dropKey, { id, kind: "pending", pos: null })
      );
    }
  }
}

function dropPlugin(add: (file: File) => Promise<string | null>) {
  return new Plugin<DropState>({
    key: dropKey,
    props: {
      decorations(state) {
        const line = dropKey.getState(state)?.line;
        const block = line ? state.doc.nodeAt(line.pos) : null;
        if (!(line && block)) {
          return null;
        }
        return DecorationSet.create(state.doc, [
          Decoration.node(line.pos, line.pos + block.nodeSize, {
            class: line.after ? "drop-line-after" : "drop-line-before",
          }),
        ]);
      },
      handleDOMEvents: {
        dragleave(view, event) {
          const to = event.relatedTarget;
          if (!(to instanceof Node && view.dom.contains(to))) {
            view.dispatch(
              view.state.tr.setMeta(dropKey, { kind: "line", line: null })
            );
          }
          return false;
        },
        dragover(view, event) {
          if (!(view.editable && carriesFiles(event.dataTransfer))) {
            return false;
          }
          event.preventDefault();
          const line = boundaryAt(view, event.clientX, event.clientY);
          const current = dropKey.getState(view.state)?.line;
          if (current?.pos !== line.pos || current.after !== line.after) {
            view.dispatch(
              view.state.tr.setMeta(dropKey, { kind: "line", line })
            );
          }
          return true;
        },
      },
      handleDrop(view, event) {
        const files = Array.from(event.dataTransfer?.files ?? []);
        const line = dropKey.getState(view.state)?.line;
        view.dispatch(
          view.state.tr.setMeta(dropKey, { kind: "line", line: null })
        );
        if (!view.editable || files.length === 0) {
          return false;
        }
        event.preventDefault();
        const at = sideOf(
          view.state.doc,
          line ?? boundaryAt(view, event.clientX, event.clientY)
        );
        addFiles(view, files, at, add);
        return true;
      },
      handlePaste(view, event) {
        const data = event.clipboardData;
        const files = Array.from(data?.files ?? []);
        // Office apps put a picture of the copied text beside the text: the words win
        if (files.length === 0 || data?.getData("text/plain").trim()) {
          return false;
        }
        event.preventDefault();
        addFiles(view, files, afterSelection(view.state), add);
        return true;
      },
    },
    state: {
      apply(tr, state) {
        const meta = tr.getMeta(dropKey) as DropMeta | undefined;
        const pending = new Map(
          [...state.pending].map(([id, pos]) => [id, tr.mapping.map(pos, 1)])
        );
        let line =
          state.line && tr.docChanged
            ? { ...state.line, pos: tr.mapping.map(state.line.pos) }
            : state.line;
        if (meta?.kind === "line") {
          ({ line } = meta);
        } else if (meta?.kind === "pending") {
          if (meta.pos === null) {
            pending.delete(meta.id);
          } else {
            pending.set(meta.id, meta.pos);
          }
        }
        return { line, pending };
      },
      init: () => ({ line: null, pending: new Map() }),
    },
  });
}

/**
 * Images on the page, kept as plain markdown: `![](image-01.jpg)`, the file in
 * the day's folder beside the page. Inline, as markdown has them, so an image
 * written inside a line of text in another editor keeps its place; one Daylily
 * adds sits in a paragraph of its own and fills the column.
 */
export const PageImage = Image.extend<PageImageOptions & { inline: boolean }>({
  addNodeView() {
    return ReactNodeViewRenderer(PageImageView);
  },

  addOptions() {
    return {
      ...this.parent?.(),
      inline: true,
      resolve: () => null,
    };
  },

  addProseMirrorPlugins() {
    return this.options.add ? [dropPlugin(this.options.add)] : [];
  },

  renderMarkdown: (node) =>
    imageMarkdown({
      alt: node.attrs?.alt ?? null,
      src: node.attrs?.src ?? null,
      title: node.attrs?.title ?? null,
    }),
});
