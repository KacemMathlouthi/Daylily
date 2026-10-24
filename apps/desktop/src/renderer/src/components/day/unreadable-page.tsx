import { FileText, Folder } from "lucide-react";
import { useCallback } from "react";
import { DayDate } from "./day-date";

/**
 * A day whose file is there but can't be read (Paper: "04e"): nothing is shown
 * rather than guessed, and the file is one click away, untouched.
 */
export function UnreadablePage({ day }: { day: string }) {
  const show = useCallback(() => window.daylily.journal.show(day), [day]);

  return (
    <div className="flex max-w-130 flex-col gap-3.5 pt-21">
      <span className="flex size-10 items-center justify-center rounded-full bg-paper-tint">
        <FileText className="size-4.25 text-ink-subtle" strokeWidth={1.9} />
      </span>
      <DayDate day={day} />
      <h1 className="font-display text-ink text-title leading-10 tracking-snug">
        This page can’t be opened here
      </h1>
      <p className="font-writing text-body text-ink-soft leading-7.25">
        Its file is still in your journal, just as it was. The few lines at the
        top, between the --- marks, aren’t in a shape Daylily can read, so it
        shows nothing rather than guess. Your words are all there: open the file
        in any text editor.
      </p>
      <div className="flex pt-1">
        <button
          className="flex h-7.5 items-center gap-1.75 rounded-row border border-line px-3 font-medium text-caption text-ink transition-colors duration-200 hover:bg-paper-sunk"
          onClick={show}
          type="button"
        >
          <Folder className="size-3.25 text-ink-muted" strokeWidth={2} />
          Show the file
        </button>
      </div>
    </div>
  );
}
