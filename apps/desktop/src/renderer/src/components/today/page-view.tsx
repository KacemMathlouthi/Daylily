import { FormatToolbar } from "@daylily/ui/components/format-toolbar";
import { PageContent } from "@daylily/ui/components/page-content";
import {
  type PageChange,
  usePageEditor,
} from "@daylily/ui/editor/use-page-editor";
import { cn } from "@daylily/ui/lib/cn";
import { type ChangeEvent, type KeyboardEvent, useCallback } from "react";
import { coverLabel, coverUrl } from "../../lib/covers";
import type { TodayPage } from "../../lib/today-page";
import { DayCover } from "../day/day-cover";
import { DayDate } from "../day/day-date";
import { NUDGES } from "./nudges";

const LINE_BREAKS = /[\r\n]+/g;

/**
 * Today's page itself: the cover, the date, a title and the writing, opening with
 * the cursor in place under "How was your day?". Keyed by day, so a new day
 * starts a new editor.
 */
export function PageView({
  page,
  sealed = false,
  ghostPrompts,
  onWrite,
  onTitle,
  onChooseCover,
}: {
  page: TodayPage;
  /** At 4am the page seals in place: the ink settles and it stops taking input. */
  sealed?: boolean;
  ghostPrompts: boolean;
  onWrite: (change: PageChange) => void;
  onTitle: (title: string) => void;
  onChooseCover: () => void;
}) {
  const editor = usePageEditor({
    autofocus: true,
    content: page.markdown,
    editable: !sealed,
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
      <DayCover
        label={page.cover ? coverLabel(page.cover) : ""}
        url={page.cover ? coverUrl(page.cover) : null}
        {...(sealed ? {} : { onChoose: onChooseCover })}
      />
      <div className="flex flex-col gap-3.5 pt-7.5">
        <DayDate day={page.day} />
        <textarea
          aria-label="Today’s title"
          className="field-sizing-content resize-none overflow-hidden bg-transparent font-display text-display-sm text-ink leading-12 tracking-title outline-none placeholder:text-ink-ghost"
          onChange={changeTitle}
          onKeyDown={titleKeys}
          placeholder="Give today a title"
          readOnly={sealed}
          rows={1}
          value={page.title}
        />
        <PageContent
          className={cn(
            "pt-1 transition-colors duration-600 ease-soft [&_.ProseMirror]:min-h-60",
            sealed && "text-ink-soft"
          )}
          editor={editor}
        />
        <FormatToolbar editor={editor} />
      </div>
    </>
  );
}
