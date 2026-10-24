import type { Metadata } from "next";

/** Where the website lives. Becomes `https://daylily.so` once the domain is ours. */
export const SITE_URL = "https://daylily-silk.vercel.app";

export const SITE_NAME = "Daylily";

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
