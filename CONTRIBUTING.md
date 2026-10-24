# Contributing to Daylily

Thank you for wanting to help. Daylily is a journal people will trust with their inner lives for years, so it grows
slowly and carefully. This page explains how to make a change that fits.

## Before you start

- **Read the [manifesto](https://daylily-silk.vercel.app/manifesto).** Every change is checked against it. Daylily
  never writes for you, never guilts you, and never locks your words away. Features that pull against that won't be
  merged, however well they're built.
- **Open an issue first** for anything bigger than a small fix, so we can agree on the shape before you write code.
  Ideas and questions are welcome in [Discussions](https://github.com/KacemMathlouthi/Daylily/discussions).
- **Visual changes are designed first.** Layout, colour, a new screen or state: describe or sketch it in an issue.
  The designs live in Paper, and code follows them closely.
- **See what's planned** in the [roadmap](ROADMAP.md) before starting something new.

## Setting up

You need Node 24 (see `.nvmrc`) and pnpm.

```sh
pnpm install
pnpm dev              # the desktop app and the website
pnpm journal:seed -- --journal /tmp/sample-journal   # sample days to look at, away from your own journal
```

The repository is a monorepo:

| Path | What's there |
|---|---|
| `apps/desktop` | The Electron app: the main process, the preload bridge and the React screens |
| `apps/web` | The website |
| `packages/core` | Pure domain logic: the 4am day boundary, sealing, frontmatter, flowers. No DOM, no Node |
| `packages/ui` | Design tokens, primitives and the page editor |

## Making a change

- **Keep words safe.** Losing someone's writing is the worst bug Daylily can have. Writes are atomic, sealed days are
  never rewritten, and unknown frontmatter is preserved.
- **Time goes through the clock** in `packages/core` and the main process: they take a clock instead of reading the
  system's, so tests can pass in their own.
- **Tests describe behaviour,** like "seals yesterday on launch after 4am". A bug fix starts with a failing test.
- **Use the design tokens.** No hard-coded colours, sizes or shadows in components.
- **No em dashes** in anything a person reads in the app or on the site.

Before you push, run:

```sh
pnpm fix && pnpm check && pnpm knip && pnpm typecheck && pnpm build && pnpm test
```

## Commits and pull requests

Commits are a title only, in the conventional format, imperative and lowercase:

```
feat(desktop): open today's page from the reminder
fix(core): seal days written across a time-zone change
```

Types: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `build`, `chore`, `perf`, `revert`. Merged commits decide the next
release, and their titles become its notes, so write them for the people who use the app. The `web` and `site` scopes
never release the app.

Keep each pull request to one concern, small enough to review in one sitting, with a short summary of what changed
and why. CI must be green on macOS, Windows and Linux.

## License

By contributing, you agree that your contributions are licensed under the [AGPL-3.0](LICENSE).
