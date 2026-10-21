export const GITHUB_URL = "https://github.com/KacemMathlouthi/Daylily";

/** Pages that don't exist yet link to "#" until they ship. */
export const NAV_LINKS = [
  { href: "#", label: "Manifesto" },
  { href: "#garden", label: "Garden" },
  { href: "#", label: "Privacy" },
  { href: GITHUB_URL, label: "GitHub" },
] as const;

export const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { href: "#", label: "Download" },
      { href: "#", label: "Changelog" },
      { href: "#", label: "Roadmap" },
    ],
  },
  {
    heading: "Principles",
    links: [
      { href: "#", label: "Manifesto" },
      { href: "#", label: "Privacy" },
      { href: "#", label: "How we use AI" },
    ],
  },
  {
    heading: "Community",
    links: [
      { href: GITHUB_URL, label: "GitHub" },
      { href: "#", label: "Discussions" },
      { href: "#", label: "Contact" },
    ],
  },
] as const;
