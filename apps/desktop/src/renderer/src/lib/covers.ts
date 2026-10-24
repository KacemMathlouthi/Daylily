import type { FlowerColor } from "@daylily/core/flower";
import type { PageCover } from "./today-page";

const FILES = import.meta.glob<string>("../assets/covers/*.jpg", {
  eager: true,
  import: "default",
});

/**
 * The bundled gallery, in Paper's order ("03c Writing · cover picker"). Each
 * carries a flower colour chosen by eye: every picture is warm golden light with
 * orange daylilies, so sampling them would grow a garden of one colour.
 */
const ORDER = [
  ["long-way-home", "Daylilies on a hillside at sunset", "daylily"],
  ["first-light", "Daylilies in a meadow at first light", "saffron"],
  ["river", "A river at dusk", "cornflower"],
  ["tea", "Tea by a sunny window", "petal"],
  ["bench", "A bench by a quiet road", "saffron"],
  ["bike", "A bicycle with a basket of flowers", "petal"],
  ["book", "An open book on a quilt", "petal"],
  ["cake", "A birthday cake with one candle", "daylily"],
  ["cottage", "A cottage at dusk", "cornflower"],
  ["flowers", "Daylilies in a jar by the window", "daylily"],
  ["rain", "Soup by a rainy window", "cornflower"],
  ["train", "Autumn hills from a train window", "saffron"],
] as const satisfies readonly (readonly [string, string, FlowerColor])[];

export type GalleryId = (typeof ORDER)[number][0];

export interface GalleryCover {
  /** The flower a day with this cover grows. */
  color: FlowerColor;
  id: GalleryId;
  /** What the picture shows, for screen readers. */
  label: string;
  url: string;
}

export const GALLERY: readonly GalleryCover[] = ORDER.map(
  ([id, label, color]) => {
    const url = FILES[`../assets/covers/${id}.jpg`];
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
