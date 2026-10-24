# Daylily roadmap

What we build next, in the order we build it. CLAUDE.md stays the source of truth for **what Daylily is**;
this file is the plan for **getting there**. Update it when an item ships, moves or changes.

**How items are ranked**

| | |
|---|---|
| **Impact** | High: changes whether people try, trust or keep using Daylily. Medium: makes it clearly better. Low: nice to have. |
| **Effort** | S: a day or less. M: a few days. L: one to two weeks. XL: a month or more, or ongoing. |
| **Feasibility** | Ready: nothing blocks it. Blocked: needs a decision, money or another item first (named). Research: the approach isn't clear yet. |

Order within a phase is the order to build. Phases mostly run one after another; **Phase M** (marketing) runs
alongside the others.

Every item is checked against the manifesto. Items marked ⚠ pull against it and need the reason written down
before they're built.

---

## Phase 1 · Finish what 0.1.0 started

Small things that make the first release look and feel complete. Mostly website and repo.

| # | Item | Why | Impact | Effort | Feasibility |
|---|---|---|---|---|---|
| 1.1 | **Test 0.1.0 on real machines** | The installers have never been run by a person. The Windows reminder notification needs the installed app to show at all. | High | S | Ready |
| 1.2 | **Changelog page** | Designed in Paper ("Changelog"). Reads the GitHub Releases at build time, so it's never out of date. | Medium | M | Blocked: design approval |
| 1.3 | **Roadmap page** | Designed in Paper ("Roadmap"). Shows this file's direction publicly, as growth stages. | Medium | M | Blocked: design approval |
| 1.4 | **Download page with real links** | It shows sample sizes and checksums today. It should offer the latest release's real files, picking the visitor's OS. | High | S | Ready |
| 1.5 | **Buy the domain, link Vercel** | `daylily.so` (open question in CLAUDE.md §12). Everything public should live on our own name. | High | S | Blocked: purchase |
| 1.6 | **Download links on our domain** | `daylily.so/download/mac` and so on redirect to the latest release asset. Links in the README, videos and posts never break when versions change. | Medium | S | After 1.5 |
| 1.7 | **README** | The repo's front page: the mark, a screenshot or short video, the principles, download links, how to build. Designed like the website, not a wall of text. | High | S | Ready |
| 1.8 | **Repo description, topics, website link** | `journal`, `diary`, `electron`, `markdown`, `local-first`, `privacy` and so on. Helps people find it. | Low | S | Ready |
| 1.9 | **Community files** | `CONTRIBUTING.md`, issue and PR templates, `SECURITY.md` (how to report a vulnerability), Discussions turned on. | Medium | S | Ready |
| 1.10 | **SEO and sharing** | An Open Graph image per page, titles and descriptions, `sitemap.xml`, `robots.txt`, structured data for the app. | Medium | S | After 1.5 |
| 1.11 | **Landing page's app mock-up** | The sidebar in the landing page's picture of the app is out of date. | Low | S | Ready |

## Phase 2 · A trustworthy first run (v1)

What CLAUDE.md §3.6 ("Definition of done for v1") still asks for. After this phase Daylily is ready to be
launched loudly.

| # | Item | Why | Impact | Effort | Feasibility |
|---|---|---|---|---|---|
| 2.1 | **Onboarding** | Designed in Paper (10a to 10c): welcome, choose the journal folder, reminder time. §3.6: "write today's page within a minute". | High | M | Ready |
| 2.2 | **End-to-end tests on the packaged app** | Playwright driving the real app: survive a force-quit mid-sentence, seal across 4am, sleep, a closed app and a time-zone change. Losing words is the worst bug Daylily can have. | High | L | Ready |
| 2.3 | **Signing: macOS** | Apple Developer ID and notarization, so macOS opens Daylily without warnings. Needed for auto-update on macOS. | High | M | Blocked: Apple Developer account ($99/year) |
| 2.4 | **Signing: Windows** | A code-signing certificate (Azure Trusted Signing is about $10/month) so SmartScreen stops warning. | High | S | Blocked: certificate |
| 2.5 | **Auto-update, checked on the splash** | The splash already shows real loading progress, so it can check for an update. Download quietly, install on the next quit, never block writing. Ask before installing; the release notes come from the changelog. | High | M | After 2.3 (macOS needs signing) |
| 2.6 | **Search** | Full-text search across every day, offline, built from the files (§3.5). See the note below on engines. | High | L | Research: what search should feel like, then design |
| 2.7 | **Polish pass** | Every state designed (empty, error, very long pages, first run); keyboard and screen readers; dark mode checked against Paper. | Medium | M | Ready |

> **Search engines.** Algolia and similar hosted engines would send people's journals to a third party, which
> breaks "your files are yours" and offline use. In the app, search uses a local index (MiniSearch, Orama, or
> SQLite FTS5), cached in `.daylily/cache/`. For a **docs site** later, a hosted or static engine is fine,
> since docs are public: Pagefind (static, free) or Algolia DocSearch (free for open-source docs). Check what
> docs sites we admire use before choosing.

## Phase M · Launch and marketing (alongside)

Starts during Phase 1; the loud launch waits for Phase 2 (signed builds and onboarding).

| # | Item | Why | Impact | Effort | Feasibility |
|---|---|---|---|---|---|
| M.1 | **Settle the message** | One sentence, three principles, the story. Everything else is built from it. | High | S | Ready |
| M.2 | **Launch video** | Finish it. The ghost prompt, the 4am seal and the garden growing are the moments to show. | High | M | Ready |
| M.3 | **Marketing assets** | Screenshots, short clips, social images, a press kit page. | High | M | After M.1 |
| M.4 | **Generate new image assets** | New covers and spot art (Codex or other tools), matched to the hand-printed style, for the site and the gallery. | Medium | M | Ready |
| M.5 | **Image quality audit** | List every image that's blurry, compressed or off-style, in the app and on the site, and decide what to replace. | Medium | S | Ready |
| M.6 | **More gallery covers** | A wider gallery (CLAUDE.md §12 asks how many, and their licence). Feeds M.4. | Medium | M | After M.5 |
| M.7 | **Store listings** | Homebrew cask, winget, Flathub. Where people already install software. | Medium | M | After 2.3 and 2.4 |
| M.8 | **Trademark search** | USPTO and EUIPO, before spending on the name (CLAUDE.md §12). | Medium | S | Ready |
| M.9 | **Launch** | Product Hunt, Hacker News (Show HN), r/journaling, r/ObsidianMD, newsletters. | High | M | After Phase 2, M.2, M.3 |

## Phase 3 · Richer days

The daily page grows, without changing what it is.

| # | Item | Why | Impact | Effort | Feasibility |
|---|---|---|---|---|---|
| 3.1 | **Media on the page: images and video** | Inline images exist; add video and files, copied into the day's folder (`video-01.mp4`), linked relatively. | High | M | Ready |
| 3.2 | **Write with your voice** | Dictation into the page. Run speech-to-text **on the device** (whisper.cpp), since the browser speech API sends audio to Google. Keep the recording as `voice-01.m4a` if the person wants it. | High | L | Research: model size and speed |
| 3.3 | **Link previews** | A pasted URL becomes a small card: title, site, picture. Stored as plain markdown (the link stays a link); the preview is fetched once and cached, and can be turned off. | Medium | M | Ready |
| 3.4 | **A song for the day** | Attach a Spotify (or Apple Music, YouTube) link as the day's song; shown as a player card. Builds on 3.3. The link lives in the frontmatter (`song:`), so the file stays readable. | Medium | S | After 3.3 |
| 3.5 | **Make it yours** | Accent colour, writing font and size, page width, turning features off (ghost prompts, the garden, the reminder). Some already exist in Settings. | Medium | M | Ready |
| 3.6 | **Export and print** | A year as a PDF book, or a zip of the journal. A journal you can hold. | Medium | M | Ready |
| 3.7 | **Import** | From Day One, Journey, Obsidian daily notes, plain markdown folders. Out of v1, but it lowers the cost of switching. | Medium | L | Ready |

## Phase 4 · Beyond the daily page ⚠

These change Daylily's shape. The thesis is "one page a day", so each needs a written answer to *why this
belongs in a journal*, a design in Paper, and a way to switch it off.

| # | Item | Why | Impact | Effort | Feasibility |
|---|---|---|---|---|---|
| 4.1 | **Year in review** ("Wrapped" for your days) | Words written, the longest streak of pages (shown kindly, never as a streak to keep), the most-used covers, the songs (3.4), the garden through the seasons, shareable as an image like the garden's card. Computed locally. | High | M | Ready |
| 4.2 | **Thoughts, a stream for the day** ⚠ | Quick notes through the day in a running, changelog-like stream. To keep the thesis: thoughts belong to **today**, live in today's folder (`thoughts.md`), and seal with the day at 4am. | Medium | M | Blocked: design |
| 4.3 | **Notes, Obsidian-style** ⚠ | Free-form notes in folders, outside the days. The biggest departure from "today is the only page": Obsidian already does this well. Could be limited to notes that link to days. | Medium | XL | Blocked: decide if it belongs |
| 4.4 | **Sidebar by kind** | Journal, Thoughts, Notes, AI, Recent. Only once 4.2 or 4.3 exist. | Low | S | After 4.2 or 4.3 |

## Phase 5 · AI that asks, never writes

Off until turned on, one feature at a time (manifesto §5). Each feature shows plainly what it sends, and where.

| # | Item | Why | Impact | Effort | Feasibility |
|---|---|---|---|---|---|
| 5.1 | **Connections** | Bring your own key (Anthropic, OpenAI…), a local model (Ollama), Sign in with ChatGPT. Keys live in the OS keychain, never in the journal. Everything else here needs this. | High | L | Ready |
| 5.2 | **Ghost prompts that listen** | The pause question reacts to what you just wrote. Sees today's page only. The signature feature, upgraded. | High | M | After 5.1 |
| 5.3 | **Ask your journal** | "What made me happiest this spring?" Answers from your own pages, with a "this sends N days to …" note. Uses the search index (2.6) to pick pages. | High | L | After 5.1, 2.6 |
| 5.4 | **Look-backs** | Weekly, monthly and yearly reflections: what went right, what was hard, patterns. Designed in Paper (08). | High | L | After 5.1 |
| 5.5 | **Highlights** | Marks the moments worth remembering on a page you wrote, without changing a word. Never rewrites, never summarises *into* the entry. | Medium | M | After 5.1 |
| 5.6 | **Terminal for agents** | An embedded terminal (xterm.js and node-pty) in the journal folder, for Claude Code, Codex or any command. For people who want it; hidden by default. | Medium | L | Ready |
| 5.7 | **Cover generation** | Make a day's cover from its words, only when asked. | Medium | M | After 5.1 |

## Phase 6 · Everywhere you write

| # | Item | Why | Impact | Effort | Feasibility |
|---|---|---|---|---|---|
| 6.1 | **Sync adapters** | Any synced folder works today. Next: a git commit at each seal (free, private), your own S3-compatible bucket, Google Drive. Behind the storage interface (CLAUDE.md §4.2). | High | XL | Ready |
| 6.2 | **Hosted sync** | Our bucket, end-to-end encrypted, as the paid service (open-core model). | High | XL | After 6.1, accounts |
| 6.3 | **Mobile apps** | iOS and Android through Capacitor, reusing the React UI. Writing in bed is part of the daily ritual. Needs sync first. | High | XL | After 6.1 |
| 6.4 | **Encryption at rest** | An optional locked journal, for shared computers. Out of v1. | Medium | L | Research |

## Phase 7 · Codexes ⚠

| # | Item | Why | Impact | Effort | Feasibility |
|---|---|---|---|---|---|
| 7.1 | **Codexes** | Long-form pieces (essays, stories, letters), private by default, publishable to `daylily.so/<name>/<piece>`. Needs accounts, hosting, moderation and abuse handling. CLAUDE.md flags it: it competes with Substack and Medium and pulls focus. A natural paid feature, if ever. | Medium | XL | Blocked: decide if, and when |

---

## Decisions waiting on the owner

- Buy `daylily.so` (1.5), and run the trademark search first (M.8).
- The Apple Developer account and a Windows certificate (2.3, 2.4).
- What search should feel like (2.6).
- Whether Notes (4.3) and Codexes (7.1) belong in Daylily.
- When Daylily is ready for 1.0.
