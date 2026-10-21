export const GITHUB_URL = "https://github.com/KacemMathlouthi/Daylily";

/** Pages that don't exist yet link to "#" until they ship. */
export const NAV_LINKS = [
  { href: "#", label: "Manifesto" },
  { href: "#garden", label: "Garden" },
  { href: "#", label: "Privacy" },
  { href: GITHUB_URL, label: "GitHub" },
] as const;
