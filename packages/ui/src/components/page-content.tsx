import { DragHandle } from "@tiptap/extension-drag-handle-react";
import type { Node as PmNode } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";
import { type Editor, EditorContent } from "@tiptap/react";
import { useCallback, useEffect, useState } from "react";
import { movingBlockKey } from "../editor/moving-block";
import { cn } from "../lib/cn";

/**
 * How a page reads, from Paper's "03 Writing": Newsreader at 18/31 in warm ink,
 * paragraphs 14px apart, a daylily caret. The same styles render a sealed day.
 */
const PAGE = cn(
  "page-content relative font-writing text-ink-2 text-writing caret-daylily",
  "[&_.ProseMirror]:flex [&_.ProseMirror]:flex-col [&_.ProseMirror]:gap-3.5 [&_.ProseMirror]:outline-none",
  // The empty page's question, from the Placeholder extension
  "[&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-ghost [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
  "[&_h2]:pt-2 [&_h2]:font-display [&_h2]:text-ink [&_h2]:text-title-xs [&_h2]:leading-8 [&_h2]:tracking-snug",
  "[&_h3]:pt-1 [&_h3]:font-display [&_h3]:text-ink [&_h3]:text-title-2xs [&_h3]:leading-7",
  "[&_strong]:font-semibold [&_strong]:text-ink",
  "[&_blockquote]:border-line-strong [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:text-ink-soft [&_blockquote]:italic",
  "[&_li]:pl-1 [&_li]:marker:text-ink-faint [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6",
  "[&_hr]:my-2 [&_hr]:border-line"
);

/**
 * List items and quotes move on their own, wherever the mouse is on them: Tiptap
 * would otherwise give their top and left edges to the list around them, which
 * can't be moved, and show no handle there.
 */
const NESTED = { edgeDetection: "none" } as const;

/** The block under the mouse, so the handle can find its first line. */
interface Hovered {
  kind: string;
  pos: number;
}

/** A heading's level makes it a kind of its own: each sits differently on its line. */
function kindOf(node: PmNode) {
  return node.type.name === "heading"
    ? `heading-${String(node.attrs.level)}`
    : node.type.name;
}

/**
 * The handle beside the block under the mouse, from Tiptap's drag handle (Paper
 * 18a, 18b): list items and quotes move on their own, with what's under them.
 * It goes while you type and comes back when the mouse moves, and the block
 * being moved goes faint where it was (MovingBlock).
 */
function BlockHandle({ editor }: { editor: Editor }) {
  const [hovered, setHovered] = useState<Hovered | null>(null);

  useEffect(() => {
    const { dom } = editor.view;
    const page = dom.parentElement;
    if (!page) {
      return;
    }
    const typing = () => page.setAttribute("data-typing", "");
    const moving = () => page.removeAttribute("data-typing");
    dom.addEventListener("keydown", typing);
    window.addEventListener("mousemove", moving);
    return () => {
      dom.removeEventListener("keydown", typing);
      window.removeEventListener("mousemove", moving);
    };
  }, [editor]);

  const onNodeChange = useCallback(
    ({ node, pos }: { node: PmNode | null; pos: number }) =>
      setHovered(node ? { kind: kindOf(node), pos } : null),
    []
  );

  const onDragStart = useCallback(() => {
    if (!hovered) {
      return;
    }
    const { pos } = hovered;
    // After the picture of it is taken, so the picture isn't faint
    setTimeout(() => {
      if (!editor.isDestroyed) {
        editor.view.dispatch(editor.state.tr.setMeta(movingBlockKey, pos));
      }
    });
  }, [editor, hovered]);

  const onDragEnd = useCallback(() => {
    if (editor.isDestroyed) {
      return;
    }
    // Landed, the block is left as written, not selected under the format toolbar
    const { tr } = editor.state;
    const at = TextSelection.near(tr.doc.resolve(tr.selection.to), -1);
    editor.view.dispatch(tr.setMeta(movingBlockKey, null).setSelection(at));
  }, [editor]);

  return (
    <DragHandle
      className="block-handle"
      editor={editor}
      nested={NESTED}
      onElementDragEnd={onDragEnd}
      onElementDragStart={onDragStart}
      onNodeChange={onNodeChange}
    >
      <span className="block-handle-grip" data-kind={hovered?.kind}>
        <svg
          aria-hidden="true"
          fill="currentColor"
          height="16"
          viewBox="0 0 10 16"
          width="10"
        >
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="8" cy="2" r="1.5" />
          <circle cx="2" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="2" cy="14" r="1.5" />
          <circle cx="8" cy="14" r="1.5" />
        </svg>
      </span>
    </DragHandle>
  );
}

/** A journal page from `usePageEditor`, styled as writing rather than a form. */
export function PageContent({
  editor,
  className,
}: {
  editor: Editor;
  className?: string;
}) {
  return (
    <>
      <EditorContent className={cn(PAGE, className)} editor={editor} />
      {/* Hidden by the handle itself on a page that can't be written */}
      <BlockHandle editor={editor} />
    </>
  );
}
