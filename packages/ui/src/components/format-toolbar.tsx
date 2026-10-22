import { type Editor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Bold,
  Heading,
  Italic,
  List,
  type LucideIcon,
  TextQuote,
} from "lucide-react";
import { Fragment, useCallback } from "react";
import { cn } from "../lib/cn";

interface Format {
  icon: LucideIcon;
  isActive: (editor: Editor) => boolean;
  label: string;
  toggle: (editor: Editor) => void;
}

/** Marks, then blocks, split by a divider as in Paper's "03b". */
const GROUPS: Format[][] = [
  [
    {
      icon: Bold,
      isActive: (editor) => editor.isActive("bold"),
      label: "Bold",
      toggle: (editor) => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: Italic,
      isActive: (editor) => editor.isActive("italic"),
      label: "Italic",
      toggle: (editor) => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: Heading,
      isActive: (editor) => editor.isActive("heading", { level: 2 }),
      label: "Heading",
      toggle: (editor) =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
  ],
  [
    {
      icon: TextQuote,
      isActive: (editor) => editor.isActive("blockquote"),
      label: "Quote",
      toggle: (editor) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      icon: List,
      isActive: (editor) => editor.isActive("bulletList"),
      label: "List",
      toggle: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
  ],
];

const FORMATS = GROUPS.flat();

/** Floating UI's placement: above the selection, from its start. */
const PLACEMENT = { offset: 8, placement: "top-start" } as const;

function FormatButton({
  editor,
  format,
  pressed,
}: {
  editor: Editor;
  format: Format;
  pressed: boolean;
}) {
  const toggle = useCallback(() => format.toggle(editor), [editor, format]);
  return (
    <button
      aria-label={format.label}
      aria-pressed={pressed}
      className={cn(
        "flex h-7 w-7.5 shrink-0 items-center justify-center rounded-row text-on-ink-2 transition-colors duration-150 hover:bg-on-ink/10 hover:text-on-ink",
        pressed && "bg-on-ink/12 text-on-ink"
      )}
      onClick={toggle}
      title={format.label}
      type="button"
    >
      <format.icon className="size-3.5" strokeWidth={2.2} />
    </button>
  );
}

/**
 * The small ink bar over a selection: bold, italic, heading, quote and list.
 * Markdown shortcuts do the same from the keyboard (**, _, #, >, -).
 */
export function FormatToolbar({ editor }: { editor: Editor }) {
  const active = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      FORMATS.map((format) => format.isActive(current)),
  });

  return (
    <BubbleMenu
      className="flex items-center gap-0.5 rounded-lg bg-ink p-1 shadow-toast"
      editor={editor}
      options={PLACEMENT}
    >
      {GROUPS.map((group, groupIndex) => (
        <Fragment key={group[0]?.label}>
          {groupIndex > 0 ? (
            <span className="mx-0.75 h-4 w-px shrink-0 bg-on-ink/15" />
          ) : null}
          {group.map((format) => (
            <FormatButton
              editor={editor}
              format={format}
              key={format.label}
              pressed={active[FORMATS.indexOf(format)] ?? false}
            />
          ))}
        </Fragment>
      ))}
    </BubbleMenu>
  );
}
