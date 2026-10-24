/** Longer days grow bigger blooms: four sizes, from a few lines to a full page. */
export type BloomSize = 0 | 1 | 2 | 3;

export function bloomSize(words: number): BloomSize {
  if (words < 150) {
    return 0;
  }
  if (words < 400) {
    return 1;
  }
  if (words < 700) {
    return 2;
  }
  return 3;
}

/** The four colours a flower blooms in, from the palette. */
export type FlowerColor = "daylily" | "petal" | "saffron" | "cornflower";

/** Each flower colour's hue in degrees, from its token (`#E8642B`, `#F08BB0`, `#F4B630`, `#4A72D8`). */
const FLOWER_HUES: [FlowerColor, number][] = [
  ["daylily", 18],
  ["saffron", 41],
  ["petal", 338],
  ["cornflower", 223],
];

/** Below these, a pixel is grey, black or white: it says nothing about colour. */
const MIN_SATURATION = 0.2;
const MIN_VALUE = 0.15;

function hueDistance(a: number, b: number) {
  const distance = Math.abs(a - b) % 360;
  return Math.min(distance, 360 - distance);
}

function nearestFlower(hue: number): FlowerColor {
  let nearest: [FlowerColor, number] = ["daylily", Number.POSITIVE_INFINITY];
  for (const [color, flowerHue] of FLOWER_HUES) {
    const distance = hueDistance(hue, flowerHue);
    if (distance < nearest[1]) {
      nearest = [color, distance];
    }
  }
  return nearest[0];
}

/** One pixel's vote: the flower nearest its hue, weighted by how vivid it is, or null for grey. */
function vote(r: number, g: number, b: number): [FlowerColor, number] | null {
  const max = Math.max(r, g, b);
  const range = max - Math.min(r, g, b);
  const saturation = max === 0 ? 0 : range / max;
  if (saturation < MIN_SATURATION || max < MIN_VALUE) {
    return null;
  }
  let hue: number;
  if (max === r) {
    hue = 60 * (((g - b) / range + 6) % 6);
  } else if (max === g) {
    hue = 60 * ((b - r) / range + 2);
  } else {
    hue = 60 * ((r - g) / range + 4);
  }
  return [nearestFlower(hue), saturation * max];
}

/**
 * A day's flower colour from its cover: each pixel votes for the flower nearest
 * its hue, vivid pixels counting more than dull ones, and the most votes win. A
 * picture with no colour in it gives the daylily. `pixels` is RGBA, as a canvas
 * reads it.
 */
export function flowerColor(pixels: ArrayLike<number>): FlowerColor {
  const votes = new Map<FlowerColor, number>();
  for (let index = 0; index + 3 < pixels.length; index += 4) {
    const opaque = (pixels[index + 3] ?? 0) >= 128;
    const pixelVote =
      opaque &&
      vote(
        (pixels[index] ?? 0) / 255,
        (pixels[index + 1] ?? 0) / 255,
        (pixels[index + 2] ?? 0) / 255
      );
    if (pixelVote) {
      const [color, weight] = pixelVote;
      votes.set(color, (votes.get(color) ?? 0) + weight);
    }
  }
  let winner: [FlowerColor, number] = ["daylily", 0];
  for (const [color, weight] of votes) {
    if (weight > winner[1]) {
      winner = [color, weight];
    }
  }
  return winner[0];
}
