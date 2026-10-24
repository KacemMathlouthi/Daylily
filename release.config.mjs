/**
 * Releases of the desktop app, made from the commits merged to main
 * (CLAUDE.md §7): a feat brings a minor version, a fix a patch, anything else
 * no release, each tagged like `v0.2.0`. The website deploys on its own, so
 * its commits never release the app. Daylily stays below 1.0 until that is
 * decided on purpose.
 */

const TYPES = [
  { section: "Features", type: "feat" },
  { section: "Bug fixes", type: "fix" },
  { section: "Performance", type: "perf" },
  { section: "Reverts", type: "revert" },
];

export default {
  branches: ["main"],
  plugins: [
    [
      // The official analyzer and notes, leaving out the website's commits
      "./release-app-commits.mjs",
      {
        preset: "conventionalcommits",
        presetConfig: { types: TYPES },
        releaseRules: [
          // Below 1.0 a breaking change is a minor release; 1.0 is a choice, not a side effect
          { breaking: true, release: "minor" },
        ],
      },
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
