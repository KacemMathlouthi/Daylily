import type { FlowerColor } from "@daylily/core/flower";
import { GALLERY_COVERS, type GalleryId } from "../../../shared/gallery";
import type { PageCover } from "./today-page";

// The gallery lives with the app's resources, where sealing reaches it too
const FILES = import.meta.glob<string>("../../../../resources/covers/*.jpg", {
  eager: true,
  import: "default",
});

export interface GalleryCover {
  /** The flower a day with this cover grows. */
  color: FlowerColor;
  id: GalleryId;
  /** What the picture shows, for screen readers. */
  label: string;
  url: string;
}

export const GALLERY: readonly GalleryCover[] = GALLERY_COVERS.map(
  ([id, label, color]) => {
    const url = FILES[`../../../../resources/covers/${id}.jpg`];
    if (!url) {
      throw new Error(`Missing gallery cover ${id}`);
    }
    return { color, id, label, url };
  }
);

/** What a day's cover shows, for screen readers. */
export function coverLabel(cover: PageCover) {
  const gallery = GALLERY.find((item) => item.id === cover.galleryId);
  return gallery?.label ?? "The day’s cover";
}
