"use client";

import { cn } from "cn";
import { ChevronRight, FileText, Folder, Image, Lock } from "lucide-react";
import { type MouseEvent, useCallback, useState } from "react";

interface Day {
  date: string;
  folder: string;
  sealed: boolean;
}

const DAYS: Day[] = [
  { date: "2026-10-18", folder: "18/", sealed: true },
  { date: "2026-10-19", folder: "19/", sealed: true },
  { date: "2026-10-20", folder: "20/", sealed: false },
];

const ROW =
  "flex h-7 w-full items-center gap-2 rounded-md pr-2 text-left transition-colors duration-200";

const FOLDER_ICON = "shrink-0 fill-[#e9c77e] text-[#e9c77e]";

/** A slice of the journal folder; each day opens to show the files it really holds. */
export function FileTree() {
  const [open, setOpen] = useState<Set<string>>(() => new Set(["20/"]));

  const toggle = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const folder = event.currentTarget.value;
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(folder)) {
        next.delete(folder);
      } else {
        next.add(folder);
      }
      return next;
    });
  }, []);

  return (
    <div className="relative z-10 flex w-full max-w-90 flex-col rounded-[14px] border border-ink/6 bg-paper-page p-2.5 font-mono text-[12.5px] shadow-[0_16px_36px_#78461e1a]">
      <div className="flex h-7 items-center gap-2 px-2 text-ink">
        <Folder className={FOLDER_ICON} size={14} />
        journal/2026/10
      </div>
      {DAYS.map((day) => {
        const isOpen = open.has(day.folder);
        return (
          <div key={day.folder}>
            <DayFolder day={day} isOpen={isOpen} onToggle={toggle} />
            {isOpen ? <DayFiles day={day} /> : null}
          </div>
        );
      })}
    </div>
  );
}

function DayFolder({
  day,
  isOpen,
  onToggle,
}: {
  day: Day;
  isOpen: boolean;
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      aria-expanded={isOpen}
      className={cn(
        ROW,
        "cursor-pointer pl-3 text-ink-muted hover:bg-ink/[0.05]"
      )}
      onClick={onToggle}
      type="button"
      value={day.folder}
    >
      <ChevronRight
        className={cn(
          "shrink-0 text-ink-faint transition-transform duration-300 ease-soft",
          isOpen && "rotate-90"
        )}
        size={12}
        strokeWidth={2.2}
      />
      <Folder className={FOLDER_ICON} size={13} />
      <span className="grow">{day.folder}</span>
      {day.sealed ? (
        <Lock className="text-ink-faint" size={11} strokeWidth={2.4} />
      ) : null}
    </button>
  );
}

function DayFiles({ day }: { day: Day }) {
  const today = !day.sealed;
  return (
    <>
      <div
        className={cn(
          ROW,
          "cursor-default pl-13",
          today ? "bg-[#fbf1e6] text-ink" : "text-ink-muted hover:bg-ink/[0.05]"
        )}
      >
        <FileText
          className={today ? "text-daylily-deep" : "text-ink-subtle"}
          size={13}
          strokeWidth={2}
        />
        <span className="grow">{day.date}.md</span>
        {today ? (
          <span className="font-sans font-semibold text-[11px] text-daylily-deep">
            today
          </span>
        ) : (
          <Lock className="text-ink-faint" size={11} strokeWidth={2.4} />
        )}
      </div>
      <div
        className={cn(
          ROW,
          "cursor-default pl-13 text-ink-muted hover:bg-ink/[0.05]"
        )}
      >
        <Image className="text-ink-subtle" size={13} strokeWidth={2} />
        cover.jpg
      </div>
    </>
  );
}
