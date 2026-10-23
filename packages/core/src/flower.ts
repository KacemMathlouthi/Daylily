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
