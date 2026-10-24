import { SITE_NAME, SITE_URL } from "@/lib/site";
import { RELEASES } from "../releases";

/** Written by hand into the source, so the feed is built once with the site. */
export const dynamic = "force-static";

const XML_SPECIAL = /[<>&'"]/g;
const XML_ENTITIES: Record<string, string> = {
  "'": "&apos;",
  '"': "&quot;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

function escapeXml(text: string) {
  return text.replace(
    XML_SPECIAL,
    (character) => XML_ENTITIES[character] ?? ""
  );
}

/** The changelog as a feed, for readers that follow releases. */
export function GET() {
  const page = new URL("/changelog", SITE_URL).href;
  const items = RELEASES.map((release) => {
    const changes = release.changes
      .map((change) => `${change.title}: ${change.body}`)
      .join("\n");
    return `    <item>
      <title>${escapeXml(`${SITE_NAME} ${release.version}: ${release.title}`)}</title>
      <link>${page}#v${release.version}</link>
      <guid isPermaLink="false">daylily-${release.version}</guid>
      <pubDate>${new Date(`${release.date}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(`${release.lead}\n\n${changes}`)}</description>
    </item>`;
  }).join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} changelog</title>
    <link>${page}</link>
    <atom:link href="${page}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Every release of Daylily, newest first.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
  return new Response(feed, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
