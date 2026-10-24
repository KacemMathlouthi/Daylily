import type { FlowerColor } from "@daylily/core/flower";

/**
 * The bundled cover gallery, in Paper's order ("03c Writing · cover picker"):
 * `resources/covers/<id>.jpg`. Each carries a flower colour chosen by eye: every
 * picture is warm golden light with orange daylilies, so sampling them would grow
 * a garden of one colour. The picker shows them; sealing gives one at random to a
 * day written without a cover.
 */
export const GALLERY_COVERS = [
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

export type GalleryId = (typeof GALLERY_COVERS)[number][0];
