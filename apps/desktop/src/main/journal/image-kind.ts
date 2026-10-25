import type { CoverExtension } from "../../shared/journal";

/** What a file's first bytes say it is, whatever its name claims. */
export type ImageKind =
  | { kind: "image"; extension: CoverExtension }
  /** iPhone photos: the page can't show them, so they're refused by name. */
  | { kind: "heic" }
  | { kind: "other" };

const ascii = (bytes: Uint8Array, from: number, to: number) =>
  String.fromCharCode(...bytes.subarray(from, to));

/** The ISO media brands that mean an AVIF, and the ones that mean HEIC. */
const AVIF_BRANDS = new Set(["avif", "avis"]);
const HEIC_BRANDS = new Set([
  "heic",
  "heix",
  "heim",
  "heis",
  "hevc",
  "hevx",
  "mif1",
  "msf1",
]);

/**
 * Reads the signature at the start of a file: JPEG, PNG, GIF, WebP and AVIF are
 * images a page can show. A pasted or dropped file is only ever named by this.
 */
export function imageKind(bytes: Uint8Array): ImageKind {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: "jpg", kind: "image" };
  }
  if (ascii(bytes, 0, 8) === "\x89PNG\r\n\x1a\n") {
    return { extension: "png", kind: "image" };
  }
  if (ascii(bytes, 0, 6) === "GIF87a" || ascii(bytes, 0, 6) === "GIF89a") {
    return { extension: "gif", kind: "image" };
  }
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") {
    return { extension: "webp", kind: "image" };
  }
  if (ascii(bytes, 4, 8) === "ftyp") {
    const brand = ascii(bytes, 8, 12);
    if (AVIF_BRANDS.has(brand)) {
      return { extension: "avif", kind: "image" };
    }
    if (HEIC_BRANDS.has(brand)) {
      return { kind: "heic" };
    }
  }
  return { kind: "other" };
}
