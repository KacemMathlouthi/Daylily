import type { PageImageOptions } from "@daylily/ui/editor/page-image";
import {
  DAY_ASSET_NAME,
  type ImageError,
  journalAssetUrl,
  MAX_IMAGE_BYTES,
} from "../../../shared/journal";

const HERE = /^\.\//;

/**
 * Where a page's image loads from: a file Daylily keeps in the day's folder, or
 * nothing. Images elsewhere on disk or on the web are never loaded.
 */
function pageImageUrl(day: string, src: string) {
  const name = src.replace(HERE, "");
  return DAY_ASSET_NAME.test(name) ? journalAssetUrl(day, name) : null;
}

/** What the status bar says when an image can't be added (Paper 14b). */
function imageProblem(error: ImageError) {
  switch (error.kind) {
    case "not-an-image":
      return error.heic
        ? "That photo is a HEIC file. Daylily can add JPEG, PNG, GIF, WebP and AVIF."
        : "That file isn’t an image Daylily can add: JPEG, PNG, GIF, WebP or AVIF.";
    case "sealed":
    case "not-writable":
      return "This day is already sealed, so it stays as it was.";
    default:
      return "Couldn’t add that image to your journal.";
  }
}

/** A sealed day's images, or a page in the search preview: shown, never added to. */
export function shownImages(day: string): PageImageOptions {
  return { resolve: (src) => pageImageUrl(day, src) };
}

/**
 * Today's images: shown, and a pasted or dropped file copied into the day's
 * folder. What goes wrong is said once, through `onProblem`.
 */
export function writtenImages(
  day: string,
  onProblem: (message: string) => void
): PageImageOptions {
  return {
    add: async (file) => {
      if (file.size > MAX_IMAGE_BYTES) {
        onProblem("That image is over 30 MB, too large to add to the page.");
        return null;
      }
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const added = await window.daylily.journal.addImage(day, bytes);
        if (added.ok) {
          return added.value;
        }
        onProblem(imageProblem(added.error));
      } catch (error) {
        console.error("Could not add the image", error);
        onProblem("Couldn’t add that image to your journal.");
      }
      return null;
    },
    resolve: (src) => pageImageUrl(day, src),
  };
}
