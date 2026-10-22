import { ImageIcon } from "lucide-react";

/**
 * The day's picture over the page (Paper: "03 Writing", "04a Sealed day"). While
 * writing, `onChoose` opens the cover picker: from the "Change cover" chip, or
 * from the soft "Add a cover" invitation when there's none yet ("03a").
 */
export function DayCover({
  url,
  label,
  onChoose,
}: {
  url: string | null;
  /** What the picture shows, for screen readers. */
  label: string;
  onChoose?: () => void;
}) {
  if (!url) {
    return onChoose ? (
      <button
        className="flex h-30 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-line-strong border-dashed bg-paper-raised transition-colors duration-200 hover:bg-paper-sunk"
        onClick={onChoose}
        type="button"
      >
        <span className="flex items-center gap-1.75 font-medium text-ink-soft text-ui">
          <ImageIcon className="size-3.75 text-ink-subtle" strokeWidth={1.9} />
          Add a cover
        </span>
        <span className="text-ink-faint text-xs">
          From the gallery or your computer. One picture for the whole day.
        </span>
      </button>
    ) : null;
  }

  return (
    <div className="relative h-42.5 overflow-hidden rounded-xl bg-paper-sunk">
      <img
        alt={label}
        className="size-full object-cover"
        height={170}
        src={url}
        width={680}
      />
      {onChoose ? (
        // Always the dark chip: it sits on a photo, whatever the theme
        <button
          className="light absolute right-2.5 bottom-2.5 rounded-row bg-ink/55 px-2.5 py-1.25 font-medium text-meta text-on-ink backdrop-blur-sm transition-colors duration-200 hover:bg-ink/70"
          onClick={onChoose}
          type="button"
        >
          Change cover
        </button>
      ) : null}
    </div>
  );
}
