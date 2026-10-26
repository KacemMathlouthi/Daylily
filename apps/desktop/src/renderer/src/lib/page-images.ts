import type { Result } from "@daylily/core/result";
import type { PageImageOptions } from "@daylily/ui/editor/page-image";
import {
  DAY_ASSET_NAME,
  type ImageError,
  journalAssetUrl,
  MAX_IMAGE_BYTES,
  noteAssetUrl,
  PAGE_IMAGE_NAME,
} from "../../../shared/journal";

const HERE = /^\.\//;
/** Where a note links its images: the notes' own images folder. */
const NOTE_IMAGES = "images/";

/**
 * Where a page's image loads from: a file Daylily keeps in the day's folder, or
 * nothing. Images elsewhere on disk or on the web are never loaded.
 */
function pageImageUrl(day: string, src: string) {
  const name = src.replace(HERE, "");
  return DAY_ASSET_NAME.test(name) ? journalAssetUrl(day, name) : null;
}

/** Where a note's image loads from: one Daylily keeps in `notes/images`, or nothing. */
function noteImageUrl(src: string) {
  const path = src.replace(HERE, "");
  const name = path.slice(NOTE_IMAGES.length);
  return path.startsWith(NOTE_IMAGES) && PAGE_IMAGE_NAME.test(name)
    ? noteAssetUrl(name)
    : null;
}

/** What the status bar says when an image can't be added (Paper 14b). */
function imageProblem(error: ImageError) {
  switch (error.kind) {
    case "not-an-image":
      return error.heic
        ? "That photo is a HEIC file. Daylily can add JPEG, PNG, GIF, WebP and AVIF."
        : "That file isn’t an image Daylily can add: JPEG, PNG, GIF, WebP or AVIF.";
    case "sealed":
      return "This day is already sealed, so it stays as it was.";
    case "not-writable":
      return "This day has ended, so it can’t take an image now.";
    default:
      return "Couldn’t add that image to your journal.";
  }
}

/** A sealed day's images, or a page in the search preview: shown, never added to. */
export function shownImages(day: string): PageImageOptions {
  return { resolve: (src) => pageImageUrl(day, src) };
}

/**
 * Copies a pasted or dropped file in through `copy`, returning the name the
 * page links it by. What goes wrong is said once, through `onProblem`.
 */
function addImage(
  copy: (bytes: Uint8Array) => Promise<Result<string, ImageError>>,
  onProblem: (message: string) => void
) {
  return async (file: File) => {
    if (file.size > MAX_IMAGE_BYTES) {
      onProblem("That image is over 30 MB, too large to add.");
      return null;
    }
    try {
      const added = await copy(new Uint8Array(await file.arrayBuffer()));
      if (added.ok) {
        return added.value;
      }
      onProblem(imageProblem(added.error));
    } catch (error) {
      console.error("Could not add the image", error);
      onProblem("Couldn’t add that image to your journal.");
    }
    return null;
  };
}

/**
 * Today's images: shown, and a pasted or dropped file copied into the day's
 * folder. What goes wrong is said once, through `onProblem`.
 */
export function writtenImages(
  day: string,
  onProblem: (message: string) => void,
  /** Thoughts never seal, so their images go into any day that has begun. */
  owner: "page" | "thoughts" = "page"
): PageImageOptions {
  return {
    add: addImage(
      (bytes) => window.daylily.journal.addImage(day, bytes, owner),
      onProblem
    ),
    resolve: (src) => pageImageUrl(day, src),
  };
}

/** A note in the search preview: its images shown, never added to. */
export function shownNoteImages(): PageImageOptions {
  return { resolve: noteImageUrl };
}

/** A note's images: shown, and a pasted or dropped file copied into `notes/images`. */
export function noteImages(
  onProblem: (message: string) => void
): PageImageOptions {
  return {
    add: addImage((bytes) => window.daylily.notes.addImage(bytes), onProblem),
    resolve: noteImageUrl,
  };
}
