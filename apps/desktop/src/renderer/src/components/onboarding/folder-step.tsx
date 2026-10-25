import { cn } from "@daylily/ui/lib/cn";
import { Folder, FolderPlus } from "lucide-react";
import { type MouseEvent, type ReactNode, useCallback } from "react";
import rocket from "../../../../../resources/covers/rocket.jpg";
import type { FolderInfo } from "../../../../shared/journal";
import {
  chosenFolder,
  type FolderChoice,
  type OnboardingStep,
  type StepProps,
  withFolder,
} from "./step";

const DAYS = new Intl.PluralRules("en");

/** `~/Daylily · 412 days`, or the path alone for a folder with nothing in it yet. */
function where(folder: FolderInfo, empty: string) {
  if (folder.days === 0) {
    return empty ? `${folder.displayPath} · ${empty}` : folder.displayPath;
  }
  const unit = DAYS.select(folder.days) === "one" ? "day" : "days";
  return `${folder.displayPath} · ${folder.days} ${unit}`;
}

/** One of the two choices, as a card (Paper 10e); the chosen one in daylily. */
function FolderCard({
  chosen,
  icon,
  title,
  detail,
  mono,
  onChoose,
  onChange,
}: {
  chosen: boolean;
  icon: ReactNode;
  title: string;
  detail: string;
  /** Whether `detail` is a path, set in the mono face. */
  mono: boolean;
  onChoose: () => void;
  onChange?: () => void;
}) {
  const change = useCallback(
    (event: MouseEvent) => {
      // Change asks for a folder; it doesn't also choose the card
      event.stopPropagation();
      onChange?.();
    },
    [onChange]
  );
  return (
    <div
      className={cn(
        "relative flex items-center gap-3.5 rounded-xl border p-4 transition-colors duration-200",
        chosen
          ? "border-[1.5px] border-daylily bg-daylily-wash"
          : "border-line-strong hover:bg-paper-sunk"
      )}
    >
      <span
        className={cn(
          "flex size-9.5 shrink-0 items-center justify-center rounded-lg",
          chosen
            ? "bg-daylily-wash-line text-daylily-deep"
            : "bg-paper-tint text-ink-muted"
        )}
      >
        {icon}
      </span>
      <span className="flex min-w-0 grow flex-col gap-0.5">
        {/* The whole card chooses; the button covers it, beneath Change */}
        <button
          aria-pressed={chosen}
          className="text-left font-semibold text-ink text-sm leading-4.5 outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring/60"
          onClick={onChoose}
          type="button"
        >
          {title}
        </button>
        <span
          className={cn(
            "truncate text-ink-subtle leading-4",
            mono ? "font-mono text-meta" : "text-caption"
          )}
        >
          {detail}
        </span>
      </span>
      {onChange ? (
        <button
          className="relative shrink-0 rounded-row px-1.5 py-1 font-medium text-caption text-daylily-ink outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
          onClick={change}
          type="button"
        >
          Change
        </button>
      ) : null}
    </div>
  );
}

/** Paper 10e and its states (10g): a new journal, the one already kept, or a folder opened. */
function YourFolder({ choices, change }: StepProps) {
  const { folder } = choices;
  const { suggested, opened } = folder;
  const choose = useCallback(
    (next: FolderChoice) => change(withFolder(next)),
    [change]
  );

  const useSuggested = useCallback(
    () => choose({ ...folder, use: "suggested" }),
    [choose, folder]
  );
  const pickSuggested = useCallback(async () => {
    const picked = await window.daylily.journal.pickFolder();
    if (picked) {
      choose({ ...folder, suggested: picked, use: "suggested" });
    }
  }, [choose, folder]);
  const pickOpened = useCallback(async () => {
    const picked = await window.daylily.journal.pickFolder();
    if (picked) {
      choose({ ...folder, opened: picked, use: "opened" });
    }
  }, [choose, folder]);
  const useOpened = useCallback(() => {
    if (opened) {
      choose({ ...folder, use: "opened" });
    } else {
      pickOpened();
    }
  }, [choose, folder, opened, pickOpened]);

  const { writable } = chosenFolder(folder);
  return (
    <>
      <div className="flex flex-col gap-2.5">
        <h1 className="font-display text-display-md text-ink leading-13 tracking-heading-sm">
          Where should your journal live?
        </h1>
        <p className="text-body-sm text-ink-muted leading-6">
          Every day is saved as a plain markdown file in a folder you own. Sync
          it however you like, or not at all.
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        <FolderCard
          chosen={folder.use === "suggested"}
          detail={where(suggested, "")}
          icon={
            suggested.days > 0 ? (
              <Folder className="size-4.5" strokeWidth={1.9} />
            ) : (
              <FolderPlus className="size-4.5" strokeWidth={1.9} />
            )
          }
          mono
          onChange={pickSuggested}
          onChoose={useSuggested}
          title={
            suggested.days > 0
              ? "Keep writing in your journal"
              : "Create a new journal"
          }
        />
        <FolderCard
          chosen={folder.use === "opened"}
          detail={
            opened
              ? where(opened, "no days yet")
              : "A Daylily journal, or a folder you sync with iCloud Drive, Dropbox or git."
          }
          icon={<Folder className="size-4.5" strokeWidth={1.9} />}
          mono={opened !== null}
          onChoose={useOpened}
          title="Open a folder you already have"
          {...(opened ? { onChange: pickOpened } : {})}
        />
        {writable ? null : (
          <p className="flex items-center gap-2 pl-1 text-caption text-ink-muted leading-4">
            <span className="size-1.5 shrink-0 rounded-full bg-daylily" />
            Daylily can’t write in that folder. Choose another one.
          </p>
        )}
      </div>
    </>
  );
}

export const folderStep: OnboardingStep = {
  art: {
    alt: "A rocket rising at dusk over a valley of daylilies",
    position: "50% 50%",
    src: rocket,
  },
  caption: {
    line: "“Hemerocallis” is Greek for beauty for a day.",
    note: "Each daylily blooms for one day. So does each page.",
  },
  Form: YourFolder,
  id: "folder",
  next: "Continue",
  ready: (choices) => chosenFolder(choices.folder).writable,
  save: (choices) =>
    window.daylily.journal.use(chosenFolder(choices.folder).path),
};
