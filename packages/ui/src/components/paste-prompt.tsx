import type { Editor } from "@tiptap/react";
import { ClipboardPaste } from "lucide-react";
import { useCallback, useEffect } from "react";
import type { MarkdownPaste } from "../editor/markdown-paste";

/** Long enough to read and decide; the text stays as pasted either way. */
const OFFER_MS = 10_000;

/**
 * Paper's "03d" paste prompt: after markdown is pasted as plain text, a small
 * bar offers to apply its formatting. Typing on, Esc, or waiting keeps it as text.
 * Key it by paste, so a second paste gets its full time.
 */
export function PastePrompt({
  editor,
  paste,
  onDone,
}: {
  editor: Editor;
  paste: MarkdownPaste;
  onDone: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDone, OFFER_MS);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDone();
      }
    };
    // Any further writing moves the pasted text, so the offer no longer fits it
    editor.on("update", onDone);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      editor.off("update", onDone);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [editor, onDone]);

  const apply = useCallback(() => {
    try {
      editor
        .chain()
        .focus()
        .insertContentAt({ from: paste.from, to: paste.to }, paste.markdown, {
          contentType: "markdown",
        })
        .run();
    } catch (error) {
      // The pasted text stays exactly as it was; formatting is only ever an offer
      console.error("Could not format the pasted markdown", error);
    } finally {
      onDone();
    }
  }, [editor, onDone, paste]);

  const keep = useCallback(() => {
    editor.commands.focus();
    onDone();
  }, [editor, onDone]);

  return (
    <div
      className="flex items-center gap-3.5 rounded-xl bg-ink py-2.5 pr-2.5 pl-4 shadow-toast motion-safe:animate-rise-in"
      role="status"
    >
      <ClipboardPaste className="size-3.75 text-daylily/60" strokeWidth={2} />
      <span className="font-medium text-on-ink text-ui">
        That looks like markdown.
      </span>
      <span className="flex gap-1.5">
        <button
          className="rounded-full bg-on-ink px-3 py-1.5 font-semibold text-ink text-xs transition-opacity duration-150 hover:opacity-90"
          onClick={apply}
          type="button"
        >
          Apply formatting
        </button>
        <button
          className="rounded-full px-3 py-1.5 font-medium text-on-ink-2 text-xs transition-colors duration-150 hover:bg-on-ink/10"
          onClick={keep}
          type="button"
        >
          Keep as text
        </button>
      </span>
    </div>
  );
}
