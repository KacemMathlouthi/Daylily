import { FormatToolbar } from "@daylily/ui/components/format-toolbar";
import { PageContent } from "@daylily/ui/components/page-content";
import {
  type PageChange,
  usePageEditor,
} from "@daylily/ui/editor/use-page-editor";
import { cn } from "@daylily/ui/lib/cn";
import { type KeyboardEvent, useCallback, useEffect, useMemo } from "react";
import { dateFormat } from "../../lib/format";
import { dayKey, fromKey } from "../../lib/month";
import { writtenImages } from "../../lib/page-images";
import {
  changeThought,
  leaveThought,
  type ShownThought,
  startNextThought,
  useFocusing,
} from "../../lib/thoughts";
import { useNow } from "../../lib/use-now";
import { MOD_KEY, Shortcut } from "../shortcut";

const WEEKDAY = dateFormat({ weekday: "long" });
const MONTH_DAY = dateFormat({ day: "numeric", month: "short" });
const FULL_DATE = dateFormat({
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** The day under a thought's time: "Today · Sunday", "Yesterday · Saturday", "Oct 12 · Monday". */
function dayLabel(day: string, today: string) {
  const weekday = WEEKDAY.format(fromKey(day));
  if (day === today) {
    return `Today · ${weekday}`;
  }
  const yesterday = fromKey(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (day === dayKey(yesterday)) {
    return `Yesterday · ${weekday}`;
  }
  const date = fromKey(day);
  const sameYear = date.getFullYear() === fromKey(today).getFullYear();
  return `${(sameYear ? MONTH_DAY : FULL_DATE).format(date)} · ${weekday}`;
}

function clock(now: Date) {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/**
 * The lane beside a thought, as the changelog shows a release's date: its time
 * in serif and its day under it. It stays in view while the thought scrolls by.
 */
function ThoughtLane({
  time,
  label,
  open = false,
}: {
  time: string;
  label: string;
  /** The thought waiting for its first word: "Now", in daylily. */
  open?: boolean;
}) {
  return (
    <div className="flex w-34 shrink-0 flex-col gap-1.5 pt-0.5 md:sticky md:top-16 md:self-start">
      <span className="font-display text-ink text-title-sm leading-8.5 tracking-snug">
        {time}
      </span>
      <span
        className={cn(
          "text-ui leading-4.5",
          open ? "font-medium text-daylily-deep" : "text-ink-muted"
        )}
      >
        {label}
      </span>
    </div>
  );
}

/** A thought's words: the page's own editor, with its formats and images. */
function ThoughtEditor({
  day,
  thought,
  today,
  onProblem,
}: {
  day: string;
  thought: ShownThought;
  today: string;
  onProblem: (message: string) => void;
}) {
  const images = useMemo(
    () => writtenImages(day, onProblem, "thoughts"),
    [day, onProblem]
  );
  const { id } = thought;
  const write = useCallback(
    ({ markdown }: PageChange) => changeThought(day, id, markdown, new Date()),
    [day, id]
  );
  const editor = usePageEditor({
    content: thought.body,
    images,
    onChange: write,
    ...(thought.begun ? {} : { placeholder: "What’s on your mind?" }),
  });

  const [focusing, focused] = useFocusing();
  useEffect(() => {
    if (focusing === id) {
      editor.commands.focus("end");
      focused();
    }
  }, [editor, focused, focusing, id]);

  useEffect(() => {
    const leave = () => leaveThought(day, id, today);
    editor.on("blur", leave);
    return () => {
      editor.off("blur", leave);
    };
  }, [day, editor, id, today]);

  const nextOnEnter = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        startNextThought(today);
      }
    },
    [today]
  );

  return (
    <div className="min-w-0" onKeyDownCapture={nextOnEnter}>
      <PageContent
        // The empty line the editor keeps after a list is for typing into, so
        // it shows only while the thought is being written
        className="[&_.ProseMirror:not(.ProseMirror-focused)>p:last-child:not(.is-editor-empty):has(>br.ProseMirror-trailingBreak:only-child)]:hidden [&_.ProseMirror]:min-h-7.75"
        editor={editor}
      />
      <FormatToolbar editor={editor} />
    </div>
  );
}

/** One thought on the screen: the lane and its words (Paper 15a to 15d). */
export function ThoughtRow({
  day,
  thought,
  today,
  newest,
  onProblem,
}: {
  day: string;
  thought: ShownThought;
  today: string;
  /** The thought at the top, being written: the key to the next one shows under it. */
  newest: boolean;
  onProblem: (message: string) => void;
}) {
  const now = useNow();
  const open = !thought.begun;
  return (
    <article className="flex gap-x-8 gap-y-3 max-md:flex-col">
      <ThoughtLane
        label={open ? "Now" : dayLabel(day, today)}
        open={open}
        time={thought.time ?? (open ? clock(now) : "")}
      />
      <div className="flex w-full min-w-0 max-w-170 flex-col gap-3 pt-0.75">
        <ThoughtEditor
          day={day}
          onProblem={onProblem}
          thought={thought}
          today={today}
        />
        {newest ? (
          <p className="flex items-center gap-1.5 text-caption text-ink-faint">
            <Shortcut keys={[MOD_KEY, "Enter"]} />
            <span className="pl-0.5">starts the next thought</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}

/** A day whose thoughts file can't be read: said, never written over. */
export function UnreadableThoughts({
  day,
  today,
}: {
  day: string;
  today: string;
}) {
  return (
    <article className="flex gap-x-8 gap-y-3 max-md:flex-col">
      <ThoughtLane label={dayLabel(day, today)} time="·" />
      <p className="max-w-170 pt-1.5 text-body-sm text-ink-muted">
        This day’s thoughts can’t be read, so Daylily won’t write over them.
        Their file is still there as it was.
      </p>
    </article>
  );
}
