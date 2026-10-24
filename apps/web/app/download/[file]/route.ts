import { FILES, latestRelease, RELEASES_URL } from "@/lib/release";

/**
 * Links that never go stale: `/download/mac` always fetches the newest
 * installer, for the README, posts and videos. Anything unknown, or a
 * release GitHub can't give us, lands on the Releases page instead.
 */
const LINKS: Record<string, RegExp> = {
  checksums: FILES.checksums,
  deb: FILES.deb,
  linux: FILES.appImage,
  mac: FILES.macArm,
  "mac-intel": FILES.macIntel,
  windows: FILES.windows,
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const pattern = LINKS[file];
  const release = pattern ? await latestRelease() : null;
  const asset = release?.assets.find((candidate) =>
    pattern?.test(candidate.name)
  );
  // Temporary, so browsers and caches ask again when the next release ships
  return Response.redirect(asset?.url ?? RELEASES_URL, 302);
}
