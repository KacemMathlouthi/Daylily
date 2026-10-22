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

type GalleryId = (typeof ORDER)[number][0];

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

/** A day's cover: one from the gallery, or a picture of the writer's own. */
export type Cover =
  | { source: "gallery"; id: GalleryId }
  | { source: "computer"; name: string; url: string };

export function coverUrl(cover: Cover) {
  return cover.source === "gallery"
    ? (GALLERY.find((item) => item.id === cover.id)?.url ?? "")
    : cover.url;
}

export function coverLabel(cover: Cover) {
  return cover.source === "gallery"
    ? (GALLERY.find((item) => item.id === cover.id)?.label ?? "Today’s cover")
    : cover.name;
}
