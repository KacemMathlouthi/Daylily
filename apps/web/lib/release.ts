import { z } from "zod";
import { GITHUB_URL } from "@/components/site/links";

const LATEST_RELEASE_API =
  "https://api.github.com/repos/KacemMathlouthi/Daylily/releases/latest";

/** Where people land when the release can't be read: GitHub's own list of files. */
export const RELEASES_URL = `${GITHUB_URL}/releases/latest`;

/** Releases come with every merge; an hour behind is close enough for a download page. */
const REFRESH_SECONDS = 3600;

const TAG_PREFIX = /^v/;

/** How each release file is told apart; the names come from electron-builder.yml. */
export const FILES = {
  appImage: /\.AppImage$/,
  checksums: /^SHA256SUMS$/,
  deb: /\.deb$/,
  macArm: /-arm64\.dmg$/,
  macIntel: /-x64\.dmg$/,
  windows: /-setup\.exe$/,
};

const releaseSchema = z.object({
  assets: z.array(
    z.object({
      browser_download_url: z.url(),
      name: z.string(),
      size: z.number(),
    })
  ),
  published_at: z.iso.datetime(),
  tag_name: z.string(),
});

interface Asset {
  name: string;
  size: number;
  url: string;
}

export interface Release {
  assets: Asset[];
  /** When it was published, as an ISO date. */
  published: string;
  /** The version without its tag's "v", like `0.1.0`. */
  version: string;
}

/**
 * The latest published release of the desktop app, or null when GitHub can't
 * be reached. The page then links to the Releases page instead of guessing
 * file names.
 */
export async function latestRelease(): Promise<Release | null> {
  try {
    const response = await fetch(LATEST_RELEASE_API, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: REFRESH_SECONDS },
    });
    if (!response.ok) {
      return null;
    }
    const parsed = releaseSchema.safeParse(await response.json());
    if (!parsed.success) {
      return null;
    }
    return {
      assets: parsed.data.assets.map((asset) => ({
        name: asset.name,
        size: asset.size,
        url: asset.browser_download_url,
      })),
      published: parsed.data.published_at,
      version: parsed.data.tag_name.replace(TAG_PREFIX, ""),
    };
  } catch {
    return null;
  }
}

/** Sizes the way a download button says them: `128 MB`. */
export function megabytes(bytes: number) {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}
