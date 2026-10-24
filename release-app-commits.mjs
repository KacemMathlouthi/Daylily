import { analyzeCommits as analyze } from "@semantic-release/commit-analyzer";
import { generateNotes as notes } from "@semantic-release/release-notes-generator";

/** Work on the website, which ships on its own, under these scopes. */
const WEBSITE = new Set(["web", "site"]);

/** `feat(web): …`, `fix(site)!: …` and the like. */
const SCOPE = /^\w+\(([^)]*)\)!?:/;

function forTheApp(context) {
  const commits = context.commits.filter((commit) => {
    const scope = SCOPE.exec(commit.message)?.[1];
    return !(scope && WEBSITE.has(scope));
  });
  return { ...context, commits };
}

/**
 * The official commit analyzer and release notes, over the commits that touch
 * the app: the website's never release it, nor appear in its notes.
 */
export const analyzeCommits = (config, context) =>
  analyze(config, forTheApp(context));

export const generateNotes = (config, context) =>
  notes(config, forTheApp(context));
