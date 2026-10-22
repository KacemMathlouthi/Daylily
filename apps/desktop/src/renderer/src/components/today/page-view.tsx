import { FormatToolbar } from "@daylily/ui/components/format-toolbar";
import { PageContent } from "@daylily/ui/components/page-content";
import {
  type PageChange,
  usePageEditor,
} from "@daylily/ui/editor/use-page-editor";
import { type ChangeEvent, type KeyboardEvent, useCallback } from "react";
import { fromKey } from "../../lib/month";
import type { TodayPage } from "../../lib/today-page";
import { NUDGES } from "./nudges";
import { PageCover } from "./page-cover";

const DATE = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  weekday: "long",
});

const LINE_BREAKS = /[\r\n]+/g;

/**
 * Today's page itself: the cover, the date, a title and the writing, opening with
 * the cursor in place under "How was your day?". Keyed by day, so a new day
 * starts a new editor.
 */
export function PageView({
  page,
  ghostPrompts,
  onWrite,
  onTitle,
  onChooseCover,
}: {
  page: TodayPage;
  ghostPrompts: boolean;
  onWrite: (change: PageChange) => void;
  onTitle: (title: string) => void;
  onChooseCover: () => void;
}) {
  const editor = usePageEditor({
    autofocus: true,
    content: page.markdown,
    ghostPrompts: { enabled: ghostPrompts, prompts: NUDGES },
    onChange: onWrite,
    placeholder: "How was your day?",
  });

  const changeTitle = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) =>
      // A title is one line, even when pasted
      onTitle(event.target.value.replace(LINE_BREAKS, " ")),
    [onTitle]
  );

  const titleKeys = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" || event.key === "ArrowDown") {
        event.preventDefault();
        editor.commands.focus("start");
      }
    },
    [editor]
  );

  return (
    <>
      <PageCover cover={page.cover} onChoose={onChooseCover} />
      <div className="flex flex-col gap-3.5 pt-7.5">
        <p className="font-medium text-ink-subtle text-xs tracking-label">
          {DATE.format(fromKey(page.day))}
        </p>
        <textarea
          aria-label="Today’s title"
          className="field-sizing-content resize-none overflow-hidden bg-transparent font-display text-display-sm text-ink leading-12 tracking-title outline-none placeholder:text-ink-ghost"
          onChange={changeTitle}
          onKeyDown={titleKeys}
          placeholder="Give today a title"
          rows={1}
          value={page.title}
        />
        <PageContent
          className="pt-1 [&_.ProseMirror]:min-h-60"
          editor={editor}
        />
        <FormatToolbar editor={editor} />
      </div>
    </>
  );
}
