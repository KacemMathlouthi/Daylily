import type { PageCover } from "./today-page";

const FILES = import.meta.glob<string>("../assets/covers/*.jpg", {
  eager: true,
  import: "default",
});

/** The bundled gallery, in Paper's order ("03c Writing · cover picker"). */
const ORDER = [
  ["long-way-home", "Daylilies on a hillside at sunset"],
  ["first-light", "Daylilies in a meadow at first light"],
  ["river", "A river at dusk"],
  ["tea", "Tea by a sunny window"],
  ["bench", "A bench by a quiet road"],
  ["bike", "A bicycle with a basket of flowers"],
  ["book", "An open book on a quilt"],
  ["cake", "A birthday cake with one candle"],
  ["cottage", "A cottage at dusk"],
  ["flowers", "Daylilies in a jar by the window"],
  ["rain", "Soup by a rainy window"],
  ["train", "Autumn hills from a train window"],
] as const;

export type GalleryId = (typeof ORDER)[number][0];

export interface GalleryCover {
  id: GalleryId;
  /** What the picture shows, for screen readers. */
  label: string;
  url: string;
}

export const GALLERY: readonly GalleryCover[] = ORDER.map(([id, label]) => {
  const url = FILES[`../assets/covers/${id}.jpg`];
  if (!url) {
    throw new Error(`Missing gallery cover ${id}`);
  }
  return { id, label, url };
});

/** What a day's cover shows, for screen readers. */
export function coverLabel(cover: PageCover) {
  const gallery = GALLERY.find((item) => item.id === cover.galleryId);
  return gallery?.label ?? "The day’s cover";
}
