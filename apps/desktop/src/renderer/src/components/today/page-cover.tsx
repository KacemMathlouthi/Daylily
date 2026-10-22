import { ImageIcon } from "lucide-react";
import { type Cover, coverUrl, GALLERY } from "../../lib/covers";

/**
 * The day's picture over the page, or a soft invitation to add one
 * (Paper: "03 Writing" and "03a Today · blank"). Both open the cover picker.
 */
export function PageCover({
  cover,
  onChoose,
}: {
  cover: Cover | null;
  onChoose: () => void;
}) {
  if (!cover) {
    return (
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
    );
  }

  const label =
    cover.source === "gallery"
      ? GALLERY.find((item) => item.id === cover.id)?.label
      : cover.name;

  return (
    <div className="relative h-42.5 overflow-hidden rounded-xl bg-paper-sunk">
      <img
        alt={label ?? "Today’s cover"}
        className="size-full object-cover"
        height={170}
        src={coverUrl(cover)}
        width={680}
      />
      {/* Always the dark chip: it sits on a photo, whatever the theme */}
      <button
        className="light absolute right-2.5 bottom-2.5 rounded-row bg-ink/55 px-2.5 py-1.25 font-medium text-meta text-on-ink backdrop-blur-sm transition-colors duration-200 hover:bg-ink/70"
        onClick={onChoose}
        type="button"
      >
        Change cover
      </button>
    </div>
  );
}
