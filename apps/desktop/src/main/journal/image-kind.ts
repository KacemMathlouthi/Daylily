import type { CoverExtension } from "../../shared/journal";

/** What a file's first bytes say it is, whatever its name claims. */
export type ImageKind =
  | { kind: "image"; extension: CoverExtension }
  /** iPhone photos: the page can't show them, so they're refused with a word of their own. */
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
 * The brands an ISO media file's opening `ftyp` box names: the major one, then
 * the compatible ones, four letters each.
 */
function ftypBrands(bytes: Uint8Array) {
  const size = new DataView(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength
  ).getUint32(0);
  const end = Math.min(size, bytes.length);
  const brands = [ascii(bytes, 8, 12)];
  for (let at = 16; at + 4 <= end; at += 4) {
    brands.push(ascii(bytes, at, at + 4));
  }
  return brands;
}

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
    const brands = ftypBrands(bytes);
    // An AVIF may name a general brand first (`mif1`) and `avif` among the rest
    if (brands.some((brand) => AVIF_BRANDS.has(brand))) {
      return { extension: "avif", kind: "image" };
    }
    if (brands.some((brand) => HEIC_BRANDS.has(brand))) {
      return { kind: "heic" };
    }
  }
  return { kind: "other" };
}
