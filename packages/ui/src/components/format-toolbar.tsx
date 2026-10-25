import { NodeSelection } from "@tiptap/pm/state";
import { type Editor, useEditorState } from "@tiptap/react";
import { BubbleMenu, type BubbleMenuProps } from "@tiptap/react/menus";
import {
  Bold,
  Check,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  ListTodo,
  type LucideIcon,
  SquareCode,
  Strikethrough,
  TextQuote,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  Fragment,
  type KeyboardEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { cn } from "../lib/cn";

interface Format {
  icon: LucideIcon;
  isActive: (editor: Editor) => boolean;
  label: string;
  toggle: (editor: Editor) => void;
}

/** Marks, headings, blocks, then the link, split by dividers as in Paper's "03d". */
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
      icon: Strikethrough,
      isActive: (editor) => editor.isActive("strike"),
      label: "Strikethrough",
      toggle: (editor) => editor.chain().focus().toggleStrike().run(),
    },
    {
      icon: Code,
      isActive: (editor) => editor.isActive("code"),
      label: "Inline code",
      toggle: (editor) => editor.chain().focus().toggleCode().run(),
    },
  ],
  [
    {
      icon: Heading2,
      isActive: (editor) => editor.isActive("heading", { level: 2 }),
      label: "Heading",
      toggle: (editor) =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: Heading3,
      isActive: (editor) => editor.isActive("heading", { level: 3 }),
      label: "Sub-heading",
      toggle: (editor) =>
        editor.chain().focus().toggleHeading({ level: 3 }).run(),
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
    {
      icon: ListOrdered,
      isActive: (editor) => editor.isActive("orderedList"),
      label: "Numbered list",
      toggle: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: ListTodo,
      isActive: (editor) => editor.isActive("taskList"),
      label: "Checklist",
      toggle: (editor) => editor.chain().focus().toggleTaskList().run(),
    },
    {
      icon: SquareCode,
      isActive: (editor) => editor.isActive("codeBlock"),
      label: "Code block",
      toggle: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    },
  ],
];

const FORMATS = GROUPS.flat();

const BUTTON =
  "flex h-7 w-7.5 shrink-0 items-center justify-center rounded-row text-on-ink-2 transition-colors duration-150 hover:bg-on-ink/10 hover:text-on-ink";
const PRESSED = "bg-on-ink/12 text-on-ink";
const DIVIDER = "mx-0.75 h-4 w-px shrink-0 bg-on-ink/15";
const HAS_SCHEME = /^(https?:\/\/|mailto:)/i;

/** A bare address gets https, as a person typing "daylily.so" means. */
function normalizeLink(text: string) {
  const trimmed = text.trim();
  if (trimmed === "") {
    return "";
  }
  return HAS_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`;
}

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
      className={cn(BUTTON, pressed && PRESSED)}
      onClick={toggle}
      title={format.label}
      type="button"
    >
      <format.icon className="size-3.5" strokeWidth={2.2} />
    </button>
  );
}

/** The toolbar turned into a field for the link's address. */
function LinkField({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const [href, setHref] = useState(
    () => (editor.getAttributes("link").href as string | undefined) ?? ""
  );
  const change = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setHref(event.target.value),
    []
  );
  const save = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const url = normalizeLink(href);
      const chain = editor.chain().focus().extendMarkRange("link");
      if (url) {
        chain.setLink({ href: url }).run();
      } else {
        chain.unsetLink().run();
      }
      onClose();
    },
    [editor, href, onClose]
  );
  const keys = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        editor.commands.focus();
        onClose();
      }
    },
    [editor, onClose]
  );

  return (
    <form className="flex items-center gap-1" onSubmit={save}>
      <input
        aria-label="Link address"
        autoFocus
        className="h-7 w-60 rounded-row bg-on-ink/8 px-2.5 font-sans text-on-ink text-ui outline-none placeholder:text-on-ink-muted"
        onChange={change}
        onKeyDown={keys}
        placeholder="Paste or type a link"
        value={href}
      />
      <button aria-label="Save link" className={BUTTON} type="submit">
        <Check className="size-3.5" strokeWidth={2.2} />
      </button>
    </form>
  );
}

/**
 * Shown over selected words, as Tiptap's own does, and never over a selected
 * image: there's nothing in it to format.
 */
function hasWordsSelected({
  editor,
  element,
  from,
  state,
  to,
  view,
}: Parameters<NonNullable<BubbleMenuProps["shouldShow"]>>[0]) {
  const { selection } = state;
  if (selection instanceof NodeSelection || selection.empty) {
    return false;
  }
  // Typing a link moves focus into the menu; it stays open meanwhile
  const inMenu = element.contains(document.activeElement);
  return (
    (view.hasFocus() || inMenu) &&
    editor.isEditable &&
    state.doc.textBetween(from, to).length > 0
  );
}

/**
 * The small ink bar over a selection (Paper: "03d"): marks, headings, lists,
 * checklists, code and links. Markdown shortcuts do the same from the keyboard.
 */
export function FormatToolbar({ editor }: { editor: Editor }) {
  const [linking, setLinking] = useState(false);
  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      formats: FORMATS.map((format) => format.isActive(current)),
      link: current.isActive("link"),
    }),
  });

  const startLink = useCallback(() => setLinking(true), []);
  const stopLink = useCallback(() => setLinking(false), []);
  // Above the selection, from its start; leaving the selection closes the link field
  const options = useMemo(
    () => ({ offset: 8, onHide: stopLink, placement: "top-start" as const }),
    [stopLink]
  );
  const unlink = useCallback(
    () => editor.chain().focus().extendMarkRange("link").unsetLink().run(),
    [editor]
  );

  return (
    <BubbleMenu
      className="flex items-center gap-0.5 rounded-lg bg-ink p-1 shadow-toast"
      editor={editor}
      options={options}
      shouldShow={hasWordsSelected}
    >
      {linking ? (
        <LinkField editor={editor} onClose={stopLink} />
      ) : (
        <>
          {GROUPS.map((group, groupIndex) => (
            <Fragment key={group[0]?.label}>
              {groupIndex > 0 ? <span className={DIVIDER} /> : null}
              {group.map((format) => (
                <FormatButton
                  editor={editor}
                  format={format}
                  key={format.label}
                  pressed={active.formats[FORMATS.indexOf(format)] ?? false}
                />
              ))}
            </Fragment>
          ))}
          <span className={DIVIDER} />
          <button
            aria-label={active.link ? "Remove link" : "Link"}
            aria-pressed={active.link}
            className={cn(BUTTON, active.link && PRESSED)}
            onClick={active.link ? unlink : startLink}
            title={active.link ? "Remove link" : "Link"}
            type="button"
          >
            <Link className="size-3.5" strokeWidth={2.2} />
          </button>
        </>
      )}
    </BubbleMenu>
  );
}
