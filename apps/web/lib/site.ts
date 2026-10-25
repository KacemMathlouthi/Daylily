import type { Metadata } from "next";

/**
 * Where the website lives: canonical links, sharing cards, the sitemap and the
 * feed all build on it. The addresses it had before (daylily-silk.vercel.app,
 * daylily.kacem.lol) redirect here, so links already out still work.
 */
export const SITE_URL = "https://daylily.ink";

export const SITE_NAME = "Daylily";

/** What Daylily is, in one line: the home page's description and the app's in search results. */
export const SITE_DESCRIPTION =
  "A human-first journal. One page a day, written by you, kept by you, grown into a garden.";

/**
 * A page's title, description and sharing card. Each page's own image sits
 * beside it as `opengraph-image.jpg`, designed in Paper ("OG · …").
 */
export function pageMetadata({
  description,
  path,
  title,
}: {
  description: string;
  path: string;
  title: string;
}): Metadata {
  return {
    alternates: { canonical: path },
    description,
    openGraph: {
      description,
      siteName: SITE_NAME,
      title,
      type: "website",
      url: path,
    },
    title,
    twitter: { card: "summary_large_image", description, title },
  };
}
