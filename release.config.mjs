/**
 * Releases of the desktop app, made from the commits merged to main
 * (CLAUDE.md §7): a feat brings a minor version, a fix a patch, anything else
 * no release, each tagged like `v0.2.0`. The website deploys on its own, so
 * its commits never release the app. Daylily stays below 1.0 until that is
 * decided on purpose.
 */

/** Work on the website, which ships separately, under these scopes. */
const WEBSITE = ["web", "site"];

const TYPES = [
  ...WEBSITE.flatMap((scope) => [
    { effect: "hidden", scope, type: "feat" },
    { effect: "hidden", scope, type: "fix" },
  ]),
  { section: "Features", type: "feat" },
  { section: "Bug fixes", type: "fix" },
  { section: "Performance", type: "perf" },
  { section: "Reverts", type: "revert" },
];

export default {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          ...WEBSITE.map((scope) => ({ release: false, scope })),
          // Below 1.0 a breaking change is a minor release; 1.0 is a choice, not a side effect
          { breaking: true, release: "minor" },
          { release: "patch", type: "perf" },
          { release: "patch", type: "revert" },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      { preset: "conventionalcommits", presetConfig: { types: TYPES } },
    ],
    [
      "@semantic-release/github",
      {
        // Published once the installers are attached, by the release workflow
        draftRelease: true,
        // No comments on issues and pull requests, and no issue when a release fails
        failComment: false,
        failTitle: false,
        releasedLabels: false,
        successComment: false,
      },
    ],
  ],
};
