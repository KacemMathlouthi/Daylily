import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { RELEASES } from "./changelog/releases";

const PAGES = ["/", "/download", "/manifesto", "/changelog", "/roadmap"];

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
