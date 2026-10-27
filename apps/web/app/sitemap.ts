import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { RELEASES } from "./changelog/releases";
import { FEATURES } from "./features/features";

const PAGES = [
  "/",
  "/download",
  "/manifesto",
  "/privacy",
  ...FEATURES.map((feature) => `/features/${feature.slug}`),
  "/changelog",
  "/roadmap",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const latestRelease = RELEASES[0]?.date;
  return PAGES.map((path) => ({
    url: new URL(path, SITE_URL).href,
    // The changelog and the download page change when a release ships
    ...(latestRelease && (path === "/changelog" || path === "/download")
      ? { lastModified: latestRelease }
      : {}),
  }));
}
