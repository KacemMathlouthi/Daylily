# Daylily roadmap

What we build next, in the order we build it. CLAUDE.md stays the source of truth for **what Daylily is**;
this file is the plan for **getting there**. Update it when an item ships, moves or changes.

**How items are ranked**

| | |
|---|---|
| **Impact** | High: changes whether people try, trust or keep using Daylily. Medium: makes it clearly better. Low: nice to have. |
| **Effort** | S: a day or less. M: a few days. L: one to two weeks. XL: a month or more, or ongoing. |
| **Feasibility** | Ready: nothing blocks it. Blocked: needs a decision, money or another item first (named). Research: the approach isn't clear yet. |

Every item is checked against the manifesto. Items marked ⚠ pull against it and need the reason written down
before they're built.

---

## v1, in order

The owner's order. Build from the top; an item that's blocked waits while the next one goes ahead.

| # | Item | Why | Impact | Effort | Feasibility |
|---|---|---|---|---|---|
| 1 | ~~**Test 0.1.0 on real machines**~~ | Installed and checked by hand on real machines. | High | S | ✓ Done, Oct 24 |
| 2 | ~~**Changelog page**~~ | `/changelog`, written by hand, one entry per release, with the next one "being written" and links to the roadmap and to suggest a change. | Medium | M | ✓ Done, Oct 24 (#41) |
| 3 | ~~**Roadmap page**~~ | `/roadmap`: everything under "Later" below, all in progress. Keep it in step with this file. | Medium | M | ✓ Done, Oct 24 (#41) |
| 4 | ~~**Download page with real links**~~ | Reads the latest GitHub Release hourly and picks the visitor's computer. Shows the real files once the repository is public (4a). | High | S | ✓ Done, Oct 24 (#41) |
| 4a | **Make the repository public** | Until then GitHub hides the release from the website and from visitors, so every download link leads nowhere. | High | S | Blocked: the owner's call |
| 5 | **Buy the domain, link Vercel** | `daylily.so` (CLAUDE.md §12). Everything public should live on our own name. A quick trademark search first. | High | S | Blocked: purchase |
| 6 | **Download links on our domain** | `daylily.so/download/mac` and so on redirect to the latest release asset. Links in the README, videos and posts never break when versions change. | Medium | S | After 4a and 5 |
| 7 | **README** | The repo's front page: the mark, a screenshot or short video, the principles, download links, how to build. Designed like the website, not a wall of text. | High | S | Ready |
| 8 | **Repo description, topics, website link** | `journal`, `diary`, `electron`, `markdown`, `local-first`, `privacy` and so on. Helps people find it. | Low | S | Ready |
| 9 | **Community files** | `CONTRIBUTING.md`, issue and PR templates, `SECURITY.md` (how to report a vulnerability), Discussions turned on. | Medium | S | Ready |
| 10 | **SEO and sharing** | An Open Graph image per page, titles and descriptions, `sitemap.xml`, `robots.txt`, structured data for the app, and an RSS feed for the changelog. | Medium | S | After 5 |
| 11 | **Landing page's app mock-up** | The sidebar in the landing page's picture of the app is out of date. While there, bring Paper up to date with the site: the header's Changelog and Roadmap links, and the Download page's two Mac files and checksums link. | Low | S | Ready |
| 12 | **End-to-end tests on the packaged app** | Playwright driving the real app: survive a force-quit mid-sentence, seal across 4am, sleep, a closed app and a time-zone change. Losing words is the worst bug Daylily can have. | High | L | Ready |
| 13 | **Auto-update, checked on the splash** | The splash already shows real loading progress, so it can check for an update. Download quietly, install on the next quit, never block writing. Ask before installing; the notes come from the changelog. Works unsigned on Windows and Linux; **macOS only updates a signed app**, so there it waits for signing (Later). | High | M | Ready, macOS blocked on signing |
| 14 | **Polish pass** | Every state designed (empty, error, very long pages, first run); keyboard and screen readers; dark mode checked against Paper. | Medium | M | Ready |
| 15 | **Search** | Full-text search across every day, offline, built from the files (§3.5). See the note on engines below. | High | L | Research: what search should feel like, then design |
| 16 | **Onboarding** | Designed in Paper (10a to 10c): welcome, choose the journal folder, reminder time. §3.6: "write today's page within a minute". | High | M | Ready |
| 17 | **Sidebar's journal item** | "Your journal" at the top of the sidebar looks like a dropdown, but there's nothing to switch to. Make it read as what it is (designed in Paper first). | Low | S | Ready |
| 18 | **Image quality audit** | List every image that's blurry, compressed or off-style, in the app and on the site, and decide what to replace. | Medium | S | Ready |
| 19 | **Generate new image assets** | New covers and spot art, matched to the hand-printed style, for the site and the gallery. | Medium | M | After 18 |
| 20 | **More gallery covers** | A wider gallery (CLAUDE.md §12 asks how many, and their licence). | Medium | M | After 19 |
| 21 | **Media on the page: images and video** | Inline images exist; add video and files, copied into the day's folder (`video-01.mp4`), linked relatively. | High | M | Ready |
| 22 | **Link previews** | A pasted URL becomes a small card: title, site, picture. Stored as plain markdown (the link stays a link); the preview is fetched once and cached, and can be turned off. | Medium | M | Ready |
| 23 | **Thoughts and notes** ⚠ | To discuss before anything is designed. Thoughts: quick notes through the day in a running stream; to keep the thesis they could belong to **today**, live in today's folder (`thoughts.md`) and seal with it at 4am. Notes: free-form, Obsidian-style, the biggest departure from "today is the only page". | Medium | M to XL | Blocked: discussion |
| 24 | **Sidebar by kind** | Journal, Thoughts, Notes, AI, Recent. Shaped by what 23 decides. | Low | S | After 23 |
| 25 | **Connections** | AI starts with **one** way in: an API key for one provider, or Sign in with ChatGPT. Keys live in the OS keychain, never in the journal. Off until turned on. | High | M | Blocked: which one first |
| 26 | **Ghost prompts that listen** | The pause question reacts to what you just wrote. Sees today's page only. The signature feature, upgraded. | High | M | After 25 |
| 27 | **Ask your journal** | "What made me happiest this spring?" Answers from your own pages, with a "this sends N days to …" note. Uses the search index (15) to pick pages. | High | L | After 25, 15 |

> **Search engines.** Algolia and similar hosted engines would send people's journals to a third party, which
> breaks "your files are yours" and offline use. In the app, search uses a local index (MiniSearch, Orama, or
> SQLite FTS5), cached in `.daylily/cache/`. For a **docs site** later, a hosted or static engine is fine,
> since docs are public: Pagefind (static, free) or Algolia DocSearch (free for open-source docs).

---

## Later

Not ordered yet. Grouped by theme.

### Trust and distribution

| Item | Why | Impact | Effort | Feasibility |
|---|---|---|---|---|
| **Signing: macOS** | Apple Developer ID and notarization, so macOS opens Daylily without warnings, and so auto-update works there. | High | M | Blocked: Apple Developer account ($99/year) |
| **Signing: Windows** | A code-signing certificate (Azure Trusted Signing is about $10/month) so SmartScreen stops warning. | High | S | Blocked: certificate |
| **Store listings** | Homebrew cask, winget, Flathub. Where people already install software. | Medium | M | After signing |

### Launch and marketing

| Item | Why | Impact | Effort | Feasibility |
|---|---|---|---|---|
| **Settle the message** | One sentence, three principles, the story. Everything else is built from it. | High | S | Ready |
| **Launch video** | The ghost prompt, the 4am seal and the garden growing are the moments to show. | High | M | Ready |
| **Marketing assets** | Screenshots, short clips, social images, a press kit page. | High | M | After the message |
| **Launch** | Product Hunt, Hacker News (Show HN), r/journaling, r/ObsidianMD, newsletters. | High | M | After v1, the video and assets |

### Richer days

| Item | Why | Impact | Effort | Feasibility |
|---|---|---|---|---|
| **Write with your voice** | Dictation into the page, with speech-to-text **on the device** (whisper.cpp), since the browser speech API sends audio to Google. Keep the recording as `voice-01.m4a` if wanted. | High | L | Research: model size and speed |
| **A song for the day** | A Spotify, Apple Music or YouTube link as the day's song, shown as a player card. Builds on link previews. Stored in the frontmatter (`song:`). | Medium | S | After link previews |
| **Make it yours** | Accent colour, writing font and size, page width, turning features off. Some already exist in Settings. | Medium | M | Ready |
| **Export and print** | A year as a PDF book, or a zip of the journal. A journal you can hold. | Medium | M | Ready |
| **Import** | From Day One, Journey, Obsidian daily notes, plain markdown folders. | Medium | L | Ready |
| **Year in review** | Words written, the most-used covers, the songs, the garden through the seasons, shareable like the garden's card. Computed locally. Never a streak to keep. | High | M | Ready |

### More AI

Each one off until turned on, and plain about what it sends.

| Item | Why | Impact | Effort | Feasibility |
|---|---|---|---|---|
| **More connections** | The other providers, local models (Ollama), and whichever of key or ChatGPT didn't come first. | Medium | M | After Connections |
| **Look-backs** | Weekly, monthly and yearly reflections. Designed in Paper (08). | High | L | After Connections |
| **Highlights** | Marks the moments worth remembering on a page, without changing a word. | Medium | M | After Connections |
| **Terminal for agents** | An embedded terminal (xterm.js and node-pty) in the journal folder, for any agent CLI. Hidden by default. | Medium | L | Ready |
| **Cover generation** | Make a day's cover from its words, only when asked. | Medium | M | After Connections |

### Everywhere you write

| Item | Why | Impact | Effort | Feasibility |
|---|---|---|---|---|
| **Sync adapters** | A git commit at each seal, your own S3-compatible bucket, Google Drive. Behind the storage interface (CLAUDE.md §4.2). | High | XL | Ready |
| **Hosted sync** | Our bucket, end-to-end encrypted, as the paid service. | High | XL | After sync adapters, accounts |
| **Mobile apps** | iOS and Android through Capacitor, reusing the React UI. Writing in bed is part of the ritual. | High | XL | After sync |
| **Encryption at rest** | An optional locked journal, for shared computers. | Medium | L | Research |

### Codexes ⚠

| Item | Why | Impact | Effort | Feasibility |
|---|---|---|---|---|
| **Codexes** | Long-form pieces, private by default, publishable to `daylily.so/<name>/<piece>`. Needs accounts, hosting and moderation; competes with Substack and Medium and pulls focus (CLAUDE.md §2). | Medium | XL | Blocked: decide if, and when |

---

## Decisions waiting on the owner

- Make the repository public (4a).
- Buy `daylily.so` (5).
- What search should feel like (15).
- Thoughts and notes: whether, and in what shape (23).
- The first AI connection: an API key for which provider, or Sign in with ChatGPT (25).
- When to pay for signing, and when Daylily is ready for 1.0.
