export interface Quote {
  author: string;
  text: string;
}

/** Shown under the progress bar, one per launch. */
const QUOTES: Quote[] = [
  {
    author: "Steve Jobs",
    text: "You can’t connect the dots looking forward; you can only connect them looking backwards.",
  },
  {
    author: "Steve Jobs",
    text: "Your time is limited, so don’t waste it living someone else’s life.",
  },
  {
    author: "Steve Jobs",
    text: "Everything around you that you call life was made up by people that were no smarter than you.",
  },
];

export function randomQuote(): Quote {
  // QUOTES is a non-empty literal, so the index is always in range
  return QUOTES[Math.floor(Math.random() * QUOTES.length)] as Quote;
}
