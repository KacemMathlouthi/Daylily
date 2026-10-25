import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Globe, ImageOff, type LucideIcon } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
import { cn } from "../lib/cn";

/** An address on the web, rather than a file. */
const WEB = /^https?:/i;

/** Paper 14b: a quiet card in the image's place, the markdown untouched. */
function Unshown({
  icon: Icon,
  title,
  note,
}: {
  icon: LucideIcon;
  title: string;
  note: string;
}) {
  return (
    <span className="flex items-center gap-3 rounded-xl border border-line bg-paper-sunk px-4.5 py-4 font-sans">
      <Icon className="size-4.5 shrink-0 text-ink-faint" strokeWidth={1.75} />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="wrap-anywhere font-medium text-ink-soft text-ui leading-4.5">
          {title}
        </span>
        <span className="text-ink-subtle text-meta leading-4">{note}</span>
      </span>
    </span>
  );
}

/**
 * An image on the page (Paper 14a): the column's width at most, its own size when
 * smaller, ringed in daylily when selected. One that can't be shown says why.
 */
export function PageImageView({
  node,
  selected,
  editor,
  extension,
}: NodeViewProps) {
  const src: string = node.attrs.src ?? "";
  const alt: string = node.attrs.alt ?? "";
  const url: string | null = extension.options.resolve(src);
  const [broken, setBroken] = useState(false);
  const fail = useCallback(() => setBroken(true), []);

  let content: ReactNode;
  const name = src || "This image";
  if (WEB.test(src) && url === null) {
    content = (
      <Unshown
        icon={Globe}
        note="Daylily never loads images from the web."
        title="An image from the web"
      />
    );
  } else if (url === null) {
    // Written by hand elsewhere: a path on disk, or a file Daylily didn't add
    content = (
      <Unshown
        icon={ImageOff}
        note="Daylily shows the images it keeps in the day’s folder."
        title={`${name} can’t be shown`}
      />
    );
  } else if (broken) {
    content = (
      <Unshown
        icon={ImageOff}
        note="It’s gone from the day’s folder, or can’t be read. Its place on the page is kept."
        title={`${name} can’t be shown`}
      />
    );
  } else {
    content = (
      // biome-ignore lint/a11y/noNoninteractiveElementInteractions: onError isn't an interaction, it tells a missing file
      // biome-ignore lint/correctness/useImageSize: the file's own size, known only once it loads
      // biome-ignore lint/performance/noImgElement: a file from the day's folder, not the website's
      <img
        alt={alt}
        className="block h-auto max-w-full rounded-xl"
        draggable={false}
        onError={fail}
        src={url}
      />
    );
  }

  return (
    <NodeViewWrapper
      as="span"
      className={cn(
        "my-1.5 block max-w-full rounded-xl outline-offset-3 transition-[outline-color] duration-150",
        // The image's own width; a card spans the column
        url !== null && !broken && "w-fit",
        selected && editor.isEditable
          ? "outline-2 outline-daylily"
          : "outline-2 outline-transparent"
      )}
      data-drag-handle=""
    >
      {content}
    </NodeViewWrapper>
  );
}
