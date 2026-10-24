import { RELEASES } from "@/app/changelog/releases";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { GITHUB_URL } from "./links";

const LESS_THAN = /</g;

/** Tells search engines Daylily is a free app for three systems, with its current version. */
export function AppSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    applicationCategory: "LifestyleApplication",
    description:
      "A human-first journal. One page a day, written by you, kept by you, grown into a garden.",
    downloadUrl: new URL("/download", SITE_URL).href,
    license: "https://www.gnu.org/licenses/agpl-3.0.html",
    name: SITE_NAME,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    operatingSystem: "macOS, Windows, Linux",
    sameAs: GITHUB_URL,
    softwareVersion: RELEASES[0]?.version,
    url: SITE_URL,
  };
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is data, and "<" is escaped so it can't close the tag
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(LESS_THAN, "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}
