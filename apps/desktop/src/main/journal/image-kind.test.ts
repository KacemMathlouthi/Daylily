import { describe, expect, it } from "vitest";
import { imageKind } from "./image-kind";

const bytes = (...parts: (string | number[])[]) =>
  new Uint8Array(
    parts.flatMap((part) =>
      typeof part === "string"
        ? [...part].map((char) => char.charCodeAt(0))
        : part
    )
  );

describe("imageKind", () => {
  it("knows the images a page can show by their first bytes", () => {
    expect(imageKind(bytes([0xff, 0xd8, 0xff, 0xe0]))).toEqual({
      extension: "jpg",
      kind: "image",
    });
    expect(imageKind(bytes([0x89], "PNG\r\n\x1a\n"))).toEqual({
      extension: "png",
      kind: "image",
    });
    expect(imageKind(bytes("GIF89a"))).toEqual({
      extension: "gif",
      kind: "image",
    });
    expect(imageKind(bytes("RIFF", [0, 0, 0, 0], "WEBPVP8 "))).toEqual({
      extension: "webp",
      kind: "image",
    });
    expect(imageKind(bytes([0, 0, 0, 28], "ftypavif"))).toEqual({
      extension: "avif",
      kind: "image",
    });
  });

  it("tells an iPhone photo apart, so it can be named", () => {
    expect(imageKind(bytes([0, 0, 0, 24], "ftypheic"))).toEqual({
      kind: "heic",
    });
    expect(imageKind(bytes([0, 0, 0, 24], "ftypmif1"))).toEqual({
      kind: "heic",
    });
  });

  it("refuses anything else, whatever it's called", () => {
    expect(imageKind(bytes("%PDF-1.7"))).toEqual({ kind: "other" });
    expect(imageKind(bytes("<svg xmlns"))).toEqual({ kind: "other" });
    expect(imageKind(bytes([0, 0, 0, 24], "ftypmp42"))).toEqual({
      kind: "other",
    });
    expect(imageKind(new Uint8Array())).toEqual({ kind: "other" });
  });
});
