import { cn } from "@daylily/ui/lib/cn";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@daylily/ui/primitives/dialog";
import { Upload, X } from "lucide-react";
import { useCallback } from "react";
import { type Cover, GALLERY, type GalleryCover } from "../../lib/covers";

function GalleryTile({
  item,
  selected,
  onPick,
}: {
  item: GalleryCover;
  selected: boolean;
  onPick: (cover: Cover) => void;
}) {
  const pick = useCallback(
    () => onPick({ id: item.id, source: "gallery" }),
    [item.id, onPick]
  );
  return (
    <button
      aria-label={item.label}
      aria-pressed={selected}
      className={cn(
        "h-23 overflow-hidden rounded-md outline-none ring-offset-2 ring-offset-paper-page transition-[box-shadow,filter] duration-200 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-ring/60",
        selected && "ring-2 ring-daylily focus-visible:ring-daylily"
      )}
      onClick={pick}
      type="button"
    >
      <img
        alt=""
        className="size-full object-cover"
        height={92}
        src={item.url}
        width={145}
      />
    </button>
  );
}

/**
 * Paper's "03c Writing · cover picker": the bundled gallery, a picture from the
 * computer, or no cover. Choosing one applies it and closes.
 */
export function CoverPicker({
  open,
  onOpenChange,
  cover,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cover: Cover | null;
  onChange: (cover: Cover | null) => void;
}) {
  const choose = useCallback(
    (next: Cover | null) => {
      onChange(next);
      onOpenChange(false);
    },
    [onChange, onOpenChange]
  );

  const fromComputer = useCallback(async () => {
    const picked = await window.daylily.cover.pick();
    if (picked) {
      choose({ name: picked.name, source: "computer", url: picked.dataUrl });
    }
  }, [choose]);

  const remove = useCallback(() => choose(null), [choose]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="max-w-165 gap-4.5 rounded-panel bg-paper-page p-6 shadow-panel ring-0 sm:max-w-165"
        overlayClassName="bg-ink/25 supports-backdrop-filter:backdrop-blur-none dark:bg-black/50"
        showCloseButton={false}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-1">
            <DialogTitle className="font-display font-normal text-ink text-title-xs leading-7.5">
              Choose a cover
            </DialogTitle>
            <DialogDescription className="text-ink-subtle text-ui leading-4.5">
              One picture for the whole day. It shows in your calendar and
              colours the day’s flower.
            </DialogDescription>
          </div>
          <DialogClose
            aria-label="Close"
            className="flex size-7 shrink-0 items-center justify-center rounded-row text-ink-muted transition-colors duration-150 hover:bg-paper-tint hover:text-ink"
          >
            <X className="size-3.75" strokeWidth={2} />
          </DialogClose>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {GALLERY.map((item) => (
            <GalleryTile
              item={item}
              key={item.id}
              onPick={choose}
              selected={cover?.source === "gallery" && cover.id === item.id}
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <button
            className="flex h-7.5 items-center gap-1.75 rounded-md border border-line px-3 font-medium text-caption text-ink transition-colors duration-150 hover:bg-paper-tint"
            onClick={fromComputer}
            type="button"
          >
            <Upload className="size-3.25 text-ink-muted" strokeWidth={2} />
            From your computer…
          </button>
          {cover ? (
            <button
              className="font-medium text-caption text-ink-subtle transition-colors duration-150 hover:text-ink"
              onClick={remove}
              type="button"
            >
              Remove cover
            </button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
