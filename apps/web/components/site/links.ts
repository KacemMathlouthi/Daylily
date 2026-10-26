export const GITHUB_URL = "https://github.com/KacemMathlouthi/Daylily";

/** Where anyone can ask for something to be built, changed or reordered. */
export const SUGGEST_URL = `${GITHUB_URL}/issues/new?template=suggestion.yml`;

export const NAV_LINKS = [
  { href: "/#features", id: "features", label: "Features" },
  { href: "/#garden", id: "garden", label: "Garden" },
  { href: "/#calendar", id: "calendar", label: "Calendar" },
  { href: "/manifesto", id: "manifesto", label: "Manifesto" },
  { href: "/changelog", id: "changelog", label: "Changelog" },
  { href: "/roadmap", id: "roadmap", label: "Roadmap" },
] as const;

/** Pages that don't exist yet link to "#" until they ship. */
export const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/download", label: "Download" },
      { href: "/changelog", label: "Changelog" },
      { href: "/roadmap", label: "Roadmap" },
    ],
  },
  {
    heading: "Principles",
    links: [
      { href: "/manifesto", label: "Manifesto" },
      { href: "/privacy", label: "Privacy" },
      { href: "#", label: "How we use AI" },
    ],
  },
  {
    heading: "Community",
    links: [
      { href: GITHUB_URL, label: "GitHub" },
      { href: `${GITHUB_URL}/discussions`, label: "Discussions" },
      { href: "#", label: "Contact" },
    ],
  },
] as const;
