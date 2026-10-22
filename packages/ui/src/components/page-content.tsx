import { type Editor, EditorContent } from "@tiptap/react";
import { cn } from "../lib/cn";

/**
 * How a page reads, from Paper's "03 Writing": Newsreader at 18/31 in warm ink,
 * paragraphs 14px apart, a daylily caret. The same styles render a sealed day.
 */
const PAGE = cn(
  "font-writing text-ink-2 text-writing caret-daylily",
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

/** A journal page from `usePageEditor`, styled as writing rather than a form. */
export function PageContent({
  editor,
  className,
}: {
  editor: Editor;
  className?: string;
}) {
  return <EditorContent className={cn(PAGE, className)} editor={editor} />;
}
