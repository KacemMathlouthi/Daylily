import { FormatToolbar } from "@daylily/ui/components/format-toolbar";
import { PageContent } from "@daylily/ui/components/page-content";
import {
  type PageChange,
  usePageEditor,
} from "@daylily/ui/editor/use-page-editor";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  changeNote,
  editTitle,
  leaveTitle,
  type OpenNote,
} from "../../lib/notes";
import { noteImages } from "../../lib/page-images";
import { useFindOnPage } from "../../lib/search";

const LINE_BREAKS = /[\r\n]+/g;

/**
 * A note itself (Paper 17a, 17b): its title in the page's large serif, then its
 * words in the page's own editor, with its formats and images. Keyed by note
 * and revision, so another note, or this one changed elsewhere, opens afresh.
 */
export function NoteView({
  note,
  find,
  onFound,
  onProblem,
}: {
  note: OpenNote;
  /** What search was looking for: the note opens at it, glowing. */
  find: string | undefined;
  /** Called once the found words have glowed, to let them go. */
  onFound: () => void;
  /** Says once, in the status bar, why an image couldn't be added. */
  onProblem: (message: string) => void;
}) {
  const { id } = note;
  const images = useMemo(() => noteImages(onProblem), [onProblem]);
  const write = useCallback(
    ({ markdown }: PageChange) => changeNote(id, { body: markdown }),
    [id]
  );
  const editor = usePageEditor({
    content: note.body,
    images,
    label: "The note",
    onChange: write,
    placeholder:
      "A list, a plan, a recipe: anything you’ll come back to and change.",
  });
  useFindOnPage(editor, find, { onDone: onFound });

  // A new note opens with the cursor in its title
  const title = useRef<HTMLTextAreaElement>(null);
  // Read as it opens: typing makes it no longer new
  const openedNew = useRef(
    note.name === null && note.title === "" && note.body === ""
  );
  useEffect(() => {
    if (openedNew.current) {
      title.current?.focus();
    }
  }, []);
  const settleTitle = useCallback(() => leaveTitle(id), [id]);
  const writeTitle = useCallback(() => editTitle(id), [id]);

  const retitle = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) =>
      // A title is one line, even when pasted
      changeNote(id, { title: event.target.value.replace(LINE_BREAKS, " ") }),
    [id]
  );

  const titleKeys = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" || event.key === "ArrowDown") {
        event.preventDefault();
        // At once, so a key pressed right after lands in the words; the
        // editor's own focus waits a frame to place the cursor
        editor.view.focus();
        editor.commands.focus("start");
      }
    },
    [editor]
  );

  return (
    <article className="flex w-full max-w-160 flex-col gap-5.5">
      <textarea
        aria-label="Note title"
        className="field-sizing-content resize-none overflow-hidden bg-transparent font-display text-display-sm text-ink leading-12 tracking-title caret-daylily outline-none placeholder:text-ink-ghost"
        onBlur={settleTitle}
        onChange={retitle}
        onFocus={writeTitle}
        onKeyDown={titleKeys}
        placeholder="Untitled"
        ref={title}
        rows={1}
        value={note.title}
      />
      <div>
        <PageContent className="[&_.ProseMirror]:min-h-60" editor={editor} />
        <FormatToolbar editor={editor} />
      </div>
    </article>
  );
}

/** A note whose file can't be read: said, never written over. */
export function UnreadableNote({ onShow }: { onShow: () => void }) {
  return (
    <article className="flex w-full max-w-160 flex-col items-start gap-3 pt-2">
      <p className="text-body-sm text-ink-muted">
        This note can’t be read, so Daylily won’t write over it. Its file is
        still there as it was.
      </p>
      <button
        className="rounded-row px-2.5 py-1.5 font-medium text-ink text-ui transition-colors duration-150 hover:bg-paper-tint"
        onClick={onShow}
        type="button"
      >
        Show in folder
      </button>
    </article>
  );
}
