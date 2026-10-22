export const GITHUB_URL = "https://github.com/KacemMathlouthi/Daylily";

export const NAV_LINKS = [
  { href: "/#features", id: "features", label: "Features" },
  { href: "/#garden", id: "garden", label: "Garden" },
  { href: "/#calendar", id: "calendar", label: "Calendar" },
  { href: "/manifesto", id: "manifesto", label: "Manifesto" },
] as const;

/** Pages that don't exist yet link to "#" until they ship. */
export const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { href: "/download", label: "Download" },
      { href: "#", label: "Changelog" },
      { href: "#", label: "Roadmap" },
    ],
  },
  {
    heading: "Principles",
    links: [
      { href: "/manifesto", label: "Manifesto" },
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
