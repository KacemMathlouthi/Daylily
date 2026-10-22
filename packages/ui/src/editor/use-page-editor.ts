import { type Editor, useEditor } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { countWords, pageExtensions } from "./extensions";
import type { GhostPromptsOptions } from "./ghost-prompts";
import type { MarkdownPaste } from "./markdown-paste";

export interface PageChange {
  markdown: string;
  words: number;
}

export interface UsePageEditorOptions {
  /** Places the cursor at the end, ready to write. */
  autofocus?: boolean;
  /** The page as markdown. Read once; later changes come from the writer. */
  content: string;
  /** False renders a sealed day: readable, selectable, never changed. */
  editable?: boolean;
  /** The questions and whether they show; leave out for pages that are only read. */
  ghostPrompts?: Pick<GhostPromptsOptions, "enabled" | "prompts"> & {
    className?: string;
  };
  onChange?: (change: PageChange) => void;
  /** Told when pasted text looks like markdown, so the page can offer to format it. */
  onMarkdownPaste?: (paste: MarkdownPaste) => void;
  placeholder?: string;
}

function readPage(editor: Editor): PageChange {
  const { doc } = editor.state;
  return {
    markdown: editor.getMarkdown(),
    words: countWords(doc.textBetween(0, doc.content.size, "\n", " ")),
  };
}

/**
 * A journal page's editor: the same core for today's page, a sealed day and,
 * later, anything else written in Daylily. Pair it with `PageContent` to show it
 * and `FormatToolbar` to format a selection.
 */
export function usePageEditor({
  content,
  editable = true,
  placeholder,
  ghostPrompts,
  autofocus = false,
  onChange,
  onMarkdownPaste,
}: UsePageEditorOptions) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onPasteRef = useRef(onMarkdownPaste);
  onPasteRef.current = onMarkdownPaste;
  const hasGhostPrompts = ghostPrompts !== undefined;

  const editor = useEditor({
    autofocus: autofocus ? "end" : false,
    content,
    contentType: "markdown",
    editable,
    // Pasted text stays as written; the paste prompt offers formatting instead
    enablePasteRules: false,
    extensions: pageExtensions({
      ...(placeholder ? { placeholder } : {}),
      ...(ghostPrompts ? { ghostPrompts } : {}),
      // Always installed, so a callback given later still works; without one it does nothing
      markdownPaste: { onPaste: (paste) => onPasteRef.current?.(paste) },
    }),
    // The editor is created in the browser only; nothing renders on a server
    immediatelyRender: true,
    onUpdate: ({ editor: current }) => {
      onChangeRef.current?.(readPage(current));
    },
    // Components that need the editor's state subscribe to it with useEditorState
    shouldRerenderOnTransaction: false,
  });

  const enabled = ghostPrompts?.enabled;
  useEffect(() => {
    // The extension is chosen when the editor is created; a later change of mind can't add it
    const installed = editor.extensionManager.extensions.some(
      (extension) => extension.name === "ghostPrompts"
    );
    if (installed && hasGhostPrompts && enabled !== undefined) {
      editor.commands.setGhostPrompts(enabled);
    }
  }, [editor, enabled, hasGhostPrompts]);

  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);

  return editor;
}
