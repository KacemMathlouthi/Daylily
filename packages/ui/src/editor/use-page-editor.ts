import { type Editor, useEditor } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { countWords, pageExtensions } from "./extensions";
import type { GhostPromptsOptions } from "./ghost-prompts";

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
}: UsePageEditorOptions) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const hasGhostPrompts = ghostPrompts !== undefined;

  const editor = useEditor({
    autofocus: autofocus ? "end" : false,
    content,
    contentType: "markdown",
    editable,
    extensions: pageExtensions({
      ...(placeholder ? { placeholder } : {}),
      ...(ghostPrompts ? { ghostPrompts } : {}),
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
    if (hasGhostPrompts && enabled !== undefined) {
      editor.commands.setGhostPrompts(enabled);
    }
  }, [editor, enabled, hasGhostPrompts]);

  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);

  return editor;
}
