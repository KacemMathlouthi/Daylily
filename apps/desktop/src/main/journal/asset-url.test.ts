import { describe, expect, it } from "vitest";
import { journalAssetUrl } from "../../shared/journal";
import { parseAssetUrl } from "./asset-url";

describe("parseAssetUrl", () => {
  it("reads the URL the page builds for a cover", () => {
    const url = journalAssetUrl("2026-10-21", "cover.jpg");
    expect(parseAssetUrl(url)).toEqual({
      day: "2026-10-21",
      name: "cover.jpg",
    });
  });

  it("reads a day's inline images", () => {
    expect(
      parseAssetUrl("daylily-journal://day/2026-10-21/image-03.png")
    ).toEqual({ day: "2026-10-21", name: "image-03.png" });
  });

  it("refuses the day's page and other files", () => {
    for (const name of ["2026-10-21.md", "notes.txt", "cover.svg", ".hidden"]) {
      expect(parseAssetUrl(journalAssetUrl("2026-10-21", name))).toBeNull();
    }
  });

  it("refuses anything that leads out of the day's folder", () => {
    const attempts = [
      "daylily-journal://day/2026-10-21/..%2F..%2Fsecret.jpg",
      "daylily-journal://day/2026-10-21/%2E%2E%2Fcover.jpg",
      "daylily-journal://day/2026-10-21/../../cover.jpg",
      "daylily-journal://day/2026-10-21/sub/cover.jpg",
      "daylily-journal://day/2026-10-21/cover.jpg%00.md",
      "daylily-journal://other/2026-10-21/cover.jpg",
      "daylily-journal://day/2026-13-01/cover.jpg",
      "file:///etc/passwd",
      "not a url",
    ];
    for (const url of attempts) {
      expect(parseAssetUrl(url)).toBeNull();
    }
  });
});
