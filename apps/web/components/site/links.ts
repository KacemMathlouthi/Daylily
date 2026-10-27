export const GITHUB_URL = "https://github.com/KacemMathlouthi/Daylily";

/** Where anyone can ask for something to be built, changed or reordered. */
export const SUGGEST_URL = `${GITHUB_URL}/issues/new?template=suggestion.yml`;

/** The header's links beside the Features menu. */
export const NAV_LINKS = [
  { href: "/manifesto", id: "manifesto", label: "Manifesto" },
  { href: "/changelog", id: "changelog", label: "Changelog" },
  { href: "/roadmap", id: "roadmap", label: "Roadmap" },
] as const;

/** What the header shows of a feature page, passed down from the server. */
export interface FeatureLink {
  name: string;
  oneLine: string;
  slug: string;
}

/** The footer's groups; its Features group is listed from the feature pages. */
export const FOOTER_LINKS = {
  community: {
    heading: "Community",
    links: [
      { href: GITHUB_URL, label: "GitHub" },
      { href: `${GITHUB_URL}/discussions`, label: "Discussions" },
      { href: "https://kacemmathlouthi.dev", label: "Contact" },
    ],
  },
  principles: {
    heading: "Principles",
    links: [
      { href: "/manifesto", label: "Manifesto" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
  product: {
    heading: "Product",
    links: [
      { href: "/download", label: "Download" },
      { href: "/changelog", label: "Changelog" },
      { href: "/roadmap", label: "Roadmap" },
    ],
  },
} as const;
