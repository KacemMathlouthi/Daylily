# Daylily

> *One page a day. Written by you, kept by you, grown into a garden.*

Daylily is a human-first desktop journal. This file is the source of truth for **what** we're building, **why**,
**how** we build it, and **where** things stand. Read it fully before starting any task, and keep it current:
when a decision is made or a milestone lands, update the relevant section in the same PR.

| | |
|---|---|
| **Status** | Website live. Desktop app skeleton running; journal logic not started. |
| **Stack** | Electron · Next.js · React · TypeScript · Tailwind 4 · Base UI · Tiptap |
| **Model** | Open-core, AGPL-3.0 |
| **Repo** | `KacemMathlouthi/Daylily` |
| **Last updated** | 2026-10-21 |

**Contents**
1. [Manifesto](#1-manifesto)
2. [The product](#2-the-product)
3. [v1 specification](#3-v1-specification)
4. [Architecture](#4-architecture)
5. [Work ethic](#5-work-ethic)
6. [Coding rules](#6-coding-rules)
7. [Commits and pull requests](#7-commits-and-pull-requests)
8. [Design system](#8-design-system)
9. [Designs and assets](#9-designs-and-assets)
10. [Progress](#10-progress)
11. [Landscape](#11-landscape)
12. [Open questions](#12-open-questions)

---

## 1. Manifesto

Most journaling apps are trying to write your journal *for* you, through AI summaries, chat-to-entry and
auto-titles. **Daylily goes the other way.** Its whole job is to get you to sit down every day and say what happened
and how it felt, in your own words. Broken grammar, typos and unfinished thoughts all count, because they're true.

### What we believe

1. **One page per day.** Today is the only page you can write. When the day ends it seals and becomes part of your
   history, honest and unedited, like ink in a paper journal.
2. **The app draws more out of you.** It opens on *"How was your day?"*, and when you pause it whispers
   *"…and how did you feel about that?"*
3. **Your days grow into a garden.** Every day you write plants a flower. Over months the garden becomes a picture
   of your life that you can stroll through.
4. **Your files are yours.** Days are plain markdown in a folder you own. You can open them in any editor, grep them,
   or read them in twenty years. No lock-in, ever.
5. **AI asks, answers and illustrates. It never writes for you.** It is off until you turn it on, feature by feature,
   with whatever model you choose.
6. **Welcome back, never guilt.** No streaks, no wilting, no shaming. A missed day is bare soil, and the door is
   always open.

### What we will never do

- AI that writes, rewrites, autocompletes, "fixes grammar" in, or summarizes *into* your entry.
- Streak punishment, wilting plants, guilt notifications.
- A proprietary database you can't read without the app.
- A social feed. Published pieces are pages, not a network.
- Neon, glassmorphism, gamified confetti, dark patterns.

### Why "Daylily"

Daylilies (*Hemerocallis*, Greek for "beauty for a day") bloom for exactly one day, and a new flower opens the next
morning. That is the one-page-a-day rule as a flower.

---

## 2. The product

The full picture, beyond v1. What ships first is in [§3](#3-v1-specification).

### The daily page
- Opens on a warm question, *"How was your day?"*, with the cursor already in place. No clutter.
- A calm, editorial markdown editor in serif type with generous margins. It should feel like paper, not a form.
- **Today only.** Past days are read-only.
- Each day has a **title** and **one cover image**. The cover represents the day in the calendar.
- Other media goes inline: images, voice notes, video, files.

### Nudges (ghost prompts): the signature interaction
- When you stop typing, faint text fades in where the cursor is: *"and how did you feel about that?"*,
  *"what do you want to do about it?"*, *"who else was there?"*
- They're **questions, never sentences you can accept**. You can't tab-complete or insert them. They vanish the
  moment you type.
- Without AI, a small curated set rotates. With AI on, they react to what you just wrote.
- Prior-art check (Oct 2026): no app shows *inline, automatic, on-pause* reflective prompts. Day One's "Go Deeper"
  needs a tap.

### The garden, calendar and graph
- **Each written day becomes a flower.** A missed day is bare soil. The garden is the screen you return to.
- **Calendar:** each day shows its title and cover, so scrolling back feels like flipping through a photo album.
- **Contribution graph:** a GitHub-style year view drawn in flowers. Same data as the garden, denser.

### AI (optional, later)

| Feature | What it does |
|---|---|
| Ghost prompts | Contextual nudges when you pause |
| Ask your journal | "What made me happiest this spring?" |
| Look-backs | Weekly, monthly and yearly retrospectives: what went right, what went wrong, patterns |
| Cover generation | Generate a day's cover from its text, only when asked |

**Connections:** bring your own key (Anthropic, OpenAI, …), local models (Ollama), Sign in with ChatGPT, an embedded
terminal running any agent CLI on the journal folder, and possibly a hosted subscription.

**Privacy is per feature and shown plainly.** Ghost prompts see only today's page. Ask and look-backs ask before
sending past days, with a clear "this sends N days to <provider>" note.

### Sync (later)
The journal is a plain folder, so any synced folder (iCloud, Dropbox, Syncthing) works today. Later: built-in git
(a commit at seal), S3-compatible buckets, Google Drive.

### Codexes (later, maybe)
Unlimited long-form pieces (essays, stories, letters), private by default, publishable to a hosted reading page.
⚠️ This competes with Substack and Medium and pulls focus from the daily-journal thesis. Out of v1. A natural paid
feature.

### Platforms
Desktop first (macOS, Windows, Linux), with Obsidian as the reference for feel and ownership. Mobile matters for a
daily ritual (writing in bed) and comes later through a Capacitor shell that reuses the React UI.

### Business model
**Open-core.** The app is free and open source under **AGPL-3.0**. The paid layer is hosted services: AI, sync,
and later codex publishing.

---

## 3. v1 specification

v1 is the **human core**: write today, seal it, see your days grow. No AI, no sync, no import.

### 3.1 Scope

| In v1 | Not in v1 |
|---|---|
| Today's page editor (title, cover, inline images) | AI of any kind |
| Sealing at 4am, read-only past days | Sync (users may place the folder in a synced folder) |
| Garden, calendar, contribution graph | Import from other apps |
| Curated offline nudges | Looking-back notes on sealed days |
| Local full-text search | Encryption at rest (rely on OS disk encryption) |
| Evening reminder | Multiple journals |
| Onboarding, settings, light and dark themes | Codexes, mobile, embedded terminal |

### 3.2 Files on disk

One journal per user. One folder per day, holding the page and all of its media.

```
<journal>/
  2026/
    10/
      21/
        2026-10-21.md
        cover.jpg
        image-01.jpg
  .daylily/
    config.json        # journal preferences, travels with the folder
    cache/             # derived data (search index, flower colours); safe to delete
```

- **Missed days have no folder.** Bare soil is the absence of a file.
- **A day's folder is created on the first keystroke**, not on opening the app. Opening without writing leaves no trace.
- **Media is copied into the day folder** and linked relatively (`![](image-01.jpg)`). A day folder is
  self-contained: move it anywhere and it still renders.
- Names: `cover.<ext>`, `image-NN.<ext>`, later `voice-NN.<ext>`.
- Markdown is CommonMark plus GFM. No proprietary syntax.

**Frontmatter**

```yaml
---
title: The long way home
cover: cover.jpg
created: 2026-10-21T19:02:11+01:00
updated: 2026-10-21T23:40:05+01:00
tz: Africa/Tunis
words: 612
sealed: 2026-10-22T04:00:00+01:00   # absent until sealed
hash: sha256:9f2c…                  # absent until sealed
app: daylily/0.1.0
---
```

- `words` and `updated` are rewritten on every save. `created` is set once.
- Unknown fields are preserved on save. Users and other tools may add their own.

**Settings are split.** Journal preferences (reminder time) live in `.daylily/config.json`. Machine-local
state (journal path, window size, theme, the sidebar's collapsed state) lives on the device, since each
screen may want its own. Secrets, such as future API keys, go in the OS
keychain and **never** into the journal folder.

### 3.3 The day boundary and sealing

- **A day runs from 04:00 to 04:00 local time.** Writing at 1am still belongs to the day being lived.
  `dayOf(now) = calendarDate(now − 4h)` in the device's current zone.
- **Time zones:** "today" follows the device's current zone. `tz` and the offsets in `created` / `sealed` record
  where it was written, so history stays honest across travel.
- **A day seals** when the boundary passes. The app checks on launch, on wake from sleep, on window focus, and with
  a timer set for the next boundary. A day left unsealed while the app was closed seals on next launch, stamped with
  its boundary time, not the launch time.
- **At seal:** finish any pending save, assign a random gallery cover if none was chosen, compute `hash`, write
  `sealed`, then treat the day as read-only.
- **Hash:** `sha256` over the canonical content, which is `title`, `cover` and the body, with LF line endings and
  trailing whitespace trimmed. `updated`, `words` and unknown fields are excluded, so harmless metadata changes don't
  break it.
- **Edited outside the app:** if the hash no longer matches, the day shows a quiet *"edited outside Daylily"* marker.
  No blocking, no restoring, no re-sealing. Trust over enforcement.
- If the writing screen is open at the boundary, the page seals in place with a gentle transition (the
  [Sealed day](#9-designs-and-assets) design) and *"How was your day?"* opens for the new day.

### 3.4 Screens

| Screen | Behaviour |
|---|---|
| **Launch** | Six-petal bloom (~1.2s with the wordmark), a greeting by time of day, a progress bar and a quote over the dusk meadow. Stays until the bloom finishes, then fades into the app. Never blocks on I/O longer than needed. |
| **Onboarding** | Three steps: *welcome*, *your folder* (choose or create the journal folder, defaulting to `~/Daylily`), *a little help* (reminder time, defaulting to 21:00; the AI options in the design are deferred). |
| **Home / Today** | Opens on *"How was your day?"* with the cursor placed. Title, cover and editor. Autosave. |
| **Writing** | Distraction-free editor. Nudges on pause. Cover picker: our gallery or your own image. |
| **Sealed day** | Read-only render of a past day with its cover, title, date and seal time. "Edited outside" marker if needed. |
| **Calendar** | Month grid of covers and titles. Empty days are bare. Click opens the sealed day. |
| **Garden** | Every written day as a flower, bare soil for missed days. Year contribution graph in flowers. |
| **Search** | Full-text search across all days. Results show date, title and a snippet, and open the day. |
| **Settings** | Journal (folder, what's on disk), Writing & sealing (ghost prompts, the 4am seal, gallery covers), Reminders (on/off, time, a preview), Appearance (light, dark, match the system; the sidebar's sun and moon switch too), About. AI hidden in v1. Paper: 09a to 09e. |

### 3.5 Behaviours

- **Autosave:** debounced (~500ms after typing stops) and on blur, quit, sleep and seal. Writes are atomic
  (temp file, fsync, rename). **Losing a user's words is the worst bug this app can have.**
- **Nudges:** after ~6s of no typing on a non-empty page, a curated question fades in at the cursor in a faint
  colour. Any keystroke dismisses it. Never insertable, never repeated twice in a row, at most one per pause.
- **Cover:** pick from the bundled gallery (copied into the day folder) or an image from disk. If none is chosen
  by seal, a random gallery cover is assigned. Days before seal show a soft "add a cover" state.
- **Flowers:** size comes from `words` in buckets; petal colour is the dominant colour sampled from the cover.
  Computed values are cached in `.daylily/cache/` and are derivable, never stored in the day file.
- **Search:** in-memory index built on launch from the files, cached, updated on save. Works fully offline.
- **Reminder:** on by default at 21:00, *"How was your day?"*. Skipped if today already has words. Never mentions
  missed days. Changeable or off in Settings.
- **External changes:** the app watches the journal folder and reflects edits made by other tools.

### 3.6 Definition of done for v1

- A new user can install, pick a folder, and write today's page within a minute.
- Pages survive a crash or force-quit mid-sentence with at most the last ~500ms lost.
- Days seal correctly across the 4am boundary, sleep, closed app and time-zone change (covered by tests).
- Every file the app writes opens cleanly in any markdown editor.
- Signed builds for macOS (dmg), Windows (exe / msi) and Linux (AppImage, deb), using the icons in `brand/icon/`.
- Light and dark themes match the Paper designs.

---

## 4. Architecture

### 4.1 Stack
- **Electron** (decided 2026-10-19). Type renders identically on every OS, which the brand depends on. The embedded
  terminal is straightforward later (xterm.js + node-pty). One language end to end. Obsidian's proven path.
  Accepted trade-off: app size (~100MB+) and memory use.
- **UI:** React + TypeScript, Tiptap editor.
- **Backend:** the Node main process, TypeScript.

### 4.2 Shape
- **The domain core is pure.** Day boundaries, sealing, hashing, frontmatter parsing, word counts and flower
  mapping are plain TypeScript with no Electron, Node or DOM imports. This is where most tests live.
- **Platform code sits behind a thin storage interface**: `readDay`, `writeToday`, `sealDay`, `listDays`,
  `watchJournal`, … The filesystem adapter is the only one in v1. Moving to Tauri, a web build or mobile later means
  writing a new adapter, nothing else.
- **The renderer never touches Node.** It talks to the main process through a typed IPC API exposed by the preload
  script via `contextBridge`. Every IPC payload is validated at the boundary.
- **Time is injected.** Nothing reads the system clock directly; a clock is passed in so sealing is testable.

### 4.3 Repo layout

```
apps/web/            Next.js website: landing, /manifesto, /download (later: docs, codexes, accounts)
apps/desktop/        Electron app
  src/main/            the backend: windows, IPC handlers, later the journal store and seal scheduler
  src/preload/         the bridge: exposes the typed window.daylily API, nothing else
  src/shared/          the IPC contract (channels, types, Zod schemas); private to the desktop app
  src/renderer/        the React app: TanStack Router routes, screens, components
packages/ui/         the shared UI, used by every app
  src/tokens/          design tokens as CSS variables (light and dark)
  src/styles/          globals.css: Tailwind setup, tokens mapped to utilities
  src/primitives/      accessible building blocks on Base UI (shadcn-generated, then owned)
  src/components/      Daylily components: Flower, Garden, DayCover, Logo…
packages/core/       later: pure domain logic (days, sealing, hashing, frontmatter, flowers)
brand/               brand and product assets
```

- Packages are imported by path, never through barrel files: `@daylily/ui/primitives/button`.
- Add primitives with the shadcn CLI from `packages/ui` (`pnpm dlx shadcn@latest add <name>`). They land in
  `packages/ui/src/primitives/`, and from then on they're our code to adapt.
- The landing page renders real components from `packages/ui` instead of screenshots.
- Landing sections live in `apps/web/components/landing/`, one file per section. Client components (`"use client"`)
  are kept to the interactive and animated parts.

### 4.4 Tooling

| Concern | Choice |
|---|---|
| Package manager | pnpm (workspaces), Node 24 (`.nvmrc`) |
| Monorepo tasks | Turborepo: `pnpm dev`, `pnpm build`, `pnpm typecheck` from the root |
| Lint and format | Ultracite on Biome: `pnpm check`, `pnpm fix` |
| Unused code and deps | knip: `pnpm knip` |
| Git hooks | Lefthook runs `ultracite fix` on staged files before each commit |
| Styling | Tailwind CSS 4, configured in CSS (`@theme`), no `tailwind.config.js` |
| Primitives | Base UI, via shadcn's `base-nova` style |
| Web framework | Next.js (App Router), deployed on Vercel |
| Motion | Motion (`motion/react`) for scroll and entrance animation; every animation honours reduced motion |
| Icons | lucide-react |
| TypeScript | 6.0. TypeScript 7 lacks the compiler API that Next and knip rely on; revisit when they support it |
| Component workbench | Storybook, later, once the first components exist |
| Desktop build | electron-vite (Vite for main, preload and renderer); electron-builder for packaging, added when we package |
| Electron | 44.x, the mature stable line; `pnpm-workspace.yaml` allows its install script |
| Desktop routing | TanStack Router, file-based, hash history (the app loads from `file://`) |
| Desktop data | TanStack Query over the `window.daylily` bridge |
| Validation | Zod at every boundary: IPC, config, frontmatter |
| CI | GitHub Actions: check, knip, typecheck, build on every PR |

Dependencies are pinned to exact versions. pnpm blocks install scripts by default; allow one only when it's needed,
in `pnpm-workspace.yaml` under `allowBuilds`.

---

## 5. Work ethic

**Every task is treated as life's work.** This is a product people will trust with their inner lives for decades.
Work accordingly.

- **Do the best possible job, not the fastest acceptable one.** Before calling something done, ask whether it is the
  version you'd be proud to show. If not, keep going.
- **Boil the ocean on understanding.** Read the surrounding code, the spec and the designs. Check edge cases (time
  zones, DST, sleep, crashes, huge entries, empty states, offline). Verify claims by running things, not by assuming.
- **Don't overcomplicate.** The best solution is the simplest one that fully solves the problem. No speculative
  abstractions, no framework for one call site, no config nobody asked for. Thoroughness lives in understanding and
  verification, not in code volume.
- **Clean UI.** Match the Paper designs closely: spacing, type, colour, motion. Every state deserves design:
  empty, loading, error, long content, first run. Calm, never busy.
- **Clean code.** Code is read far more than written. Clear names, small focused units, obvious data flow.
- **Built to last and to grow.** Choose structures that make the next feature easy (AI providers, sync adapters,
  mobile) without building those features early. Keep boundaries clean so parts can be replaced.
- **Leave it better.** Fix small things you touch. Update this file when reality changes.
- **Be honest.** If something is unfinished, untested or uncertain, say so plainly.
- **Ask, as much as you need.** This is cooperative work. Whenever something is ambiguous, or you're simply unsure
  what's wanted, ask, as many questions as it takes (the `AskUserQuestion` tool is preferred). A few minutes spent
  understanding each other is always cheaper than building the wrong thing. Never guess silently on product,
  design or architecture choices.

---

## 6. Coding rules

### TypeScript
- `strict: true`, plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. No `any`; use `unknown` and
  narrow. No non-null assertions without a comment explaining why they're safe.
- Prefer plain functions and data over classes. Make illegal states unrepresentable with discriminated unions.
- Validate all external data at the boundary (files, IPC, config) with a schema library, then trust the types inside.
- Errors are values where failure is expected (a malformed file is expected); throw only for bugs.
- Named exports, no default exports. One concept per module.

### Electron security
- `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`, a strict Content Security Policy.
- The preload exposes a minimal, typed API; never expose `ipcRenderer` itself.
- Never load remote content into app windows. Open external links in the system browser.
- Validate and normalize every path from the renderer; it must stay inside the journal folder.

### Data safety
- **Never lose user words.** Atomic writes (temp file, fsync, rename), save on every lifecycle event, and tests for
  crash recovery.
- Never rewrite a sealed day's content. Never delete user files.
- Preserve unknown frontmatter and markdown exactly as written.
- All dates go through the injected clock and an explicit time zone. Store ISO 8601 with offsets.

### React and UI
- Function components and hooks. Keep state close to where it's used; lift only when shared.
- **shadcn first.** Before writing any UI building block (button, sidebar, dialog, menu, tooltip, input, command
  palette…), check whether shadcn has it. If it does, add it with the CLI from `packages/ui`
  (`pnpm dlx shadcn@latest add <name>`), then style it with our tokens. Hand-write only what is Daylily's own:
  the garden, flowers, the mark, covers, the editor's nudges.
- Generated primitives stay close to upstream so updates stay easy; Biome relaxes its stricter style rules for
  `packages/ui/src/primitives` and `hooks`.
- Design tokens are CSS custom properties ([§8](#8-design-system)). No hard-coded colours, sizes or fonts in
  components.
- Accessible by default: semantic HTML, keyboard navigation everywhere, visible focus, WCAG AA contrast, and
  respect for `prefers-reduced-motion`.
- Motion is slow and soft (200–400ms, ease-out). Nothing bounces.

### Testing
- **Vitest** for the core and components; **Playwright** for end-to-end flows in the packaged app.
- Every core function has unit tests, including DST transitions, time-zone changes and the 4am boundary.
- A bug fix starts with a failing test.
- Tests describe behaviour ("seals yesterday on launch after 4am"), not implementation.

### Style and hygiene
- Ultracite (Biome) for lint and format, and knip for unused code, both enforced in CI. No warnings left behind.
- Comments explain **why**, never what. Delete commented-out code.
- Dependencies must earn their place: well maintained, small, and better than a few lines of our own code.
  Pin versions; commit the lockfile.
- No dead code, no TODOs without an issue link.
- Cross-platform always: use `path` utilities and test on macOS, Windows and Linux in CI.

---

## 7. Commits and pull requests

### Commits
- **Title only**, conventional format: `type(scope): summary`
  - types: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `build`, `chore`, `perf`
  - imperative, lowercase, no trailing period
  - e.g. `feat(core): seal days at the 4am boundary`
- **No description body, no `Co-Authored-By` trailer, no AI tool or session links.**
- **Atomic:** one concern per commit, committed as you go. A commit need not build on its own when splitting keeps
  review readable.

### Branches and pull requests
- Never commit directly to `main`. Branch from an up-to-date `main` with a short descriptive name
  (`app-icon`, `core-sealing`).
- One concern per PR. Keep them small enough to review in one sitting.
- **Title:** brief and plain, sentence case (e.g. "App icon for macOS, Windows and Linux").
- **Body:** a short summary, a few bullets at most. **No mention of Claude, AI tools or sessions.**
- CI must be green: lint, typecheck, tests.
- Update this file in the same PR when the work changes the spec, decisions or progress.

---

## 8. Design system

The feel: a warm, unhurried, welcoming, editorial place in nature. Serif headlines, warm off-white paper, earthy
tones, hand-printed botanical art. In the spirit of Anthropic's visual language.

**Voice:** a kind friend who listens and never lectures. *"How was your day?"*, not *"Log your entry."* A missed day
gets *"Welcome back"*, never *"You broke your streak."*

**No em dashes** (—) anywhere users can read them: UI copy, page and window titles, metadata, docs pages. Use a colon,
a comma, a middle dot (·) or two sentences instead.

### Type

| Role | Family |
|---|---|
| Display and headings | Instrument Serif |
| Writing (the page) | Newsreader |
| UI chrome | Instrument Sans |
| Code and data | Geist Mono |

### Colour

| Token | Light | Use |
|---|---|---|
| `paper` | `#F4EEE3` | App background |
| `paper-raised` | `#FBF8F3` | Panels, sidebar |
| `paper-page` | `#FFFDF9` | The writing page |
| `ink` | `#241B15` | Text |
| `daylily` | `#E8642B` | Primary accent, the flower |
| `saffron` | `#F4B630` | Secondary accent |
| `petal` | `#F08BB0` | Accent |
| `moss` | `#4F6B3A` | Growth, success |
| `cornflower` | `#4A72D8` | Links, sparingly |
| `soil` | `#8A5A3C` | Bare days, earth |

**Where tokens live.** Colours are CSS variables in `packages/ui/src/tokens/tokens.css` (light and dark). The same file's
`@theme` block holds the scales, which become Tailwind utilities: type (`text-ui`, `text-lead`, `text-display`…,
plus fluid `text-fluid-*`), tracking, leading, radii (`rounded-row`, `rounded-panel`…) and shadows (`shadow-card`,
`shadow-press-ink`…). The website's painted backgrounds are named utilities in `apps/web/app/globals.css`
(`bg-hero-sky`, `bg-garden-glow`…). Components use these names only: no hex values, one-off sizes or shadows.

Text and surfaces use a graded ink scale rather than opacity: `ink`, `ink-2` (writing), `ink-soft`, `ink-muted`,
`ink-subtle`, `ink-faint`, `ink-ghost`, plus `ghost` for ghost prompts, `line` for hairlines, and `paper-sunk` /
`paper-tint` for sunken and tinted surfaces. All live in `packages/ui/src/tokens/tokens.css`.

Dark theme: the same warm browns taken close to black: the sidebar `#0E0B09`, the page `#14100D`, raised
surfaces `#18130F`, with the same accents (Paper: "05d Calendar · dark"). The exact values for every token
are in the Paper file and should be read with the Paper MCP (`get_computed_styles`, `get_jsx`), never guessed from
screenshots.

### Logo
A single six-petal daylily. The flat mark works as a 16px favicon (`apps/web/app/icon.svg`). The textured,
hand-printed mark is for the app icon and large uses (`brand/landing/spots/mark-textured.png`).

---

## 9. Designs and assets

### Paper file: "Daylily — Landing"
The design source of truth. Open it in Paper and use the Paper MCP to read exact values when implementing.

**Design first, in Paper.** Every visual change (layout, position, colour, a new page or state) is made in Paper
and agreed with the owner before it is implemented in code. Code then follows Paper exactly. When code and Paper
drift, sync Paper back to what was agreed.

| Page | Contents |
|---|---|
| v1 | First landing page draft (superseded) |
| v2 Landing | The website: the landing page, Header · scrolled, Buttons · states, Manifesto, Download |
| v3 App screens | 01 Launch · 01b Launch bloom (motion storyboard) · 02 Home · 03 Writing · 04 Sealed day · 05 Calendar · 06 Garden · 07 Ask your journal · 08 Look-backs · 09 Settings · AI · 10a–c Onboarding (welcome, your folder, a little help) · 11 Writing · dark |
| v4 App icon | macOS (light and dark), Windows, Linux, and an icon overview board |

Screens 07, 08 and the AI parts of 09 and 10c are designed for later releases and are **not in v1**.

### Repository assets

| Path | Contents |
|---|---|
| `brand/brand-identity.png`, `logo.png`, `logo-mark.png`, `palette.png` | Original brand identity |
| `brand/brand-art.png`, `brand-art-2.png`, `brand-art-3.png` | Hand-printed botanical art pieces, no text |
| `brand/main-view-*.png`, `calendar-*.png` | Early generated mockups (reference only; the Paper designs supersede them) |
| `brand/landing/hero-meadow.png`, `footer-dusk.png` | Landing hero and footer art |
| `brand/landing/covers/` | Nine day covers (bike, book, cake, cottage, path, rain, river, tea, train), a muted rain variant and a wide path cover. Seed for the v1 cover gallery. |
| `brand/landing/spots/` | Spot illustrations (seal, sprout, pages) and the transparent textured mark |
| `brand/landing/textures/` | Torn paper edge, grain, garden contribution graph (PNG and SVG) |
| `brand/landing/*-sheet.png` | Source sheets the covers and spots were cut from |
| `brand/icon/` | App icons: `daylily.icns` (macOS), `daylily.ico` (Windows, 16–256px), `linux-{16…512}.png`, and 1024px masters for each platform |
| `apps/web/public/images/` | Web-sized copies of the art and covers used by the landing page |

`*.mcpb` bundles and `.playwright-mcp/` are ignored.

---

## 10. Progress

| Date | Milestone |
|---|---|
| 2026-10-19 | Vision captured; Electron chosen |
| 2026-10-20 | Brand art, mockups, landing page designed in Paper and exported to `site/` (PR #1, merged) |
| 2026-10-20 to 21 | App screens designed in Paper: launch, home, writing, sealed day, calendar, garden, ask, look-backs, settings, onboarding, dark mode |
| 2026-10-21 | App icons for macOS, Windows and Linux (PR #2, merged) |
| 2026-10-21 | v1 product decisions recorded; this file became the project manifesto |
| 2026-10-22 | Monorepo set up: pnpm, Turborepo, Ultracite, knip, Lefthook, CI; `packages/ui` and `apps/web` |
| 2026-10-22 | Landing page built in Next.js from the Paper design, with live product parts and Motion; static `site/` export removed |
| 2026-10-22 | Sticky header with section links, deeper buttons, Manifesto and Download pages; designed in Paper first |
| 2026-10-22 | Desktop skeleton: secure Electron window, typed preload bridge, app shell with sidebar and routes |
| 2026-10-22 | Launch screen: the bloom, a greeting by time of day and a quote, over mocked loading until storage exists |
| 2026-10-22 | Light and dark themes from a sidebar toggle; the sidebar folds into an icon rail; the month calendar on sample days |
| 2026-10-22 | Home and garden screens on a year and a half of sample days; Settings with five sections, designed in Paper first |

### Next
1. Build `packages/core`: day boundary, sealing, hashing and frontmatter, fully tested.
2. Filesystem storage adapter with atomic writes and folder watching.
3. Today's page: editor, title, cover, autosave.
4. Sealing in the running app, then the sealed day view.
5. Calendar, garden, search, onboarding, settings, reminder.
6. Packaging and signing for all three platforms.

---

## 11. Landscape

Researched Oct 2026. **Almost every feature exists somewhere on its own. The combination doesn't.**

| Feature | Already exists in |
|---|---|
| Local markdown, sync, heatmaps, agent terminal | Obsidian and plugins |
| AI "go deeper" prompts, AI images, publishing | Day One (Gold tier), but cloud-based, closed, and its AI co-writes |
| Sealing past days | **at8pm** (iOS, Sept 2026): days lock at a chosen hour. Lightmark makes entries immutable |
| Calendar of daily photos | Journey, Day One |
| AI retrospection | Rosebud, Mindsera, Day One |
| Garden or flower per entry | Gratitude Garden, One Year Daily Journal, Garden of You; Forest and Finch for habits |

**What looks unclaimed:** inline ghost prompts that appear automatically on pause; a hard "AI never writes" stance;
and the combination of a journal-specific desktop app on files you own, with today as the only writable page,
opt-in AI from any provider, and a garden.

**Honest take:** the hook is the principles, not the features. *Your files, today only, AI that asks but never
writes.* The garden is the expected visual layer, not a moat. We'd be second to at8pm on sealing.

**Name checks (Oct 2026):** no journaling or software collisions; npm `daylily` is free; `daylily.so` looks free,
`daylily.app` and `getdaylily.com` look parked, `daylilyjournal.com` is taken; the bare GitHub org is taken.

---

## 12. Open questions

- **Domain and trademark:** buy `daylily.so`; check whether `daylily.app` can be bought; run a USPTO/EUIPO trademark
  search.
- **Cover gallery:** how many covers ship with the app, and how they're licensed.
- **Curated nudges:** the exact set of offline questions and how they rotate.
- **Codexes:** when, if ever, and whether they're the paid feature.
