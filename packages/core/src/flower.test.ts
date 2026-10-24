import { describe, expect, it } from "vitest";
import { bloomSize, flowerColor } from "./flower";

describe("bloomSize", () => {
  it("grows with the words written", () => {
    expect(bloomSize(0)).toBe(0);
    expect(bloomSize(149)).toBe(0);
    expect(bloomSize(150)).toBe(1);
    expect(bloomSize(399)).toBe(1);
    expect(bloomSize(400)).toBe(2);
    expect(bloomSize(699)).toBe(2);
    expect(bloomSize(700)).toBe(3);
    expect(bloomSize(20_000)).toBe(3);
  });
});

/** An image as canvas pixels: RGBA, one entry per pixel. */
function image(...pixels: [number, number, number, number?][]) {
  return pixels.flatMap(([r, g, b, a = 255]) => [r, g, b, a]);
}
const repeat = (count: number, pixel: [number, number, number]) =>
  Array.from({ length: count }, () => pixel);

describe("flowerColor", () => {
  it("snaps a cover's colour to the nearest flower", () => {
    expect(flowerColor(image([232, 100, 43]))).toBe("daylily");
    expect(flowerColor(image([244, 182, 48]))).toBe("saffron");
    expect(flowerColor(image([240, 139, 176]))).toBe("petal");
    expect(flowerColor(image([74, 114, 216]))).toBe("cornflower");
  });

  it("follows the colour most of the picture is", () => {
    const mostlySky = image(
      ...repeat(70, [80, 130, 220]),
      ...repeat(30, [230, 110, 40])
    );
    expect(flowerColor(mostlySky)).toBe("cornflower");
  });

  it("lets vivid colour outweigh dull colour", () => {
    // A dull blue-grey wall, coloured enough to vote, under a few bright orange
    // flowers: counted pixel by pixel the wall would win
    const dullTable = image(
      ...repeat(80, [100, 110, 140]),
      ...repeat(20, [240, 100, 30])
    );
    expect(flowerColor(dullTable)).toBe("daylily");
  });

  it("ignores near-black, near-white and see-through pixels", () => {
    const pixels = image(
      ...repeat(50, [5, 5, 30]),
      ...repeat(50, [252, 250, 255]),
      [74, 114, 216, 0],
      [240, 139, 176]
    );
    expect(flowerColor(pixels)).toBe("petal");
  });

  it("gives a black and white picture the daylily", () => {
    expect(flowerColor(image(...repeat(10, [128, 128, 128])))).toBe("daylily");
    expect(flowerColor([])).toBe("daylily");
  });

  it("takes greens and teals to the nearest flower", () => {
    expect(flowerColor(image([110, 170, 60]))).toBe("saffron");
    expect(flowerColor(image([40, 170, 170]))).toBe("cornflower");
  });
});
