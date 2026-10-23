import { describe, expect, it } from "vitest";
import { bloomSize } from "./flower";

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
