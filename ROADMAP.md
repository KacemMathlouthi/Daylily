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
| 4 | ~~**Download page with real links**~~ | Reads the latest GitHub Release hourly and picks the visitor's computer. The repository is public (4a), so the files show. | High | S | ✓ Done, Oct 24 (#41) |
| 4a | ~~**Make the repository public**~~ | Public, so the website and visitors can reach the releases. | High | S | ✓ Done, Oct 25 |
| 5 | **Buy the domain, link Vercel** | `daylily.so` (CLAUDE.md §12). Everything public should live on our own name. A quick trademark search first. | High | S | Blocked: purchase |
| 6 | ~~**Download links on our domain**~~ | `/download/mac`, `mac-intel`, `windows`, `linux`, `deb` and `checksums` redirect to the latest release's file. On `daylily-silk.vercel.app` until the domain (5). | Medium | S | ✓ Done, Oct 25 |
| 7 | ~~**README**~~ | Designed in Paper ("v5 · README"): hero, the app, three moments, download buttons, principles, install and build. The app picture is still the design mock; swap in a real screenshot. | High | S | ✓ Done, Oct 25 |
| 8 | ~~**Repo description, topics, website link**~~ | Set, with Discussions and private vulnerability reporting on. The social preview image is uploaded by hand in Settings (10). | Low | S | ✓ Done, Oct 25 |
| 9 | ~~**Community files**~~ | `CONTRIBUTING.md`, `SECURITY.md`, issue forms (something isn't right, suggest a change) and a pull request template. | Medium | S | ✓ Done, Oct 25 |
| 10 | ~~**SEO and sharing**~~ | A sharing card per page (Paper: "OG · …"), titles, descriptions and canonical links, `sitemap.xml`, `robots.txt`, JSON-LD for the app, and the changelog's RSS feed. All on `SITE_URL` in `apps/web/lib/site.ts`, to switch when the domain lands. | Medium | S | ✓ Done, Oct 25 |
| 11 | ~~**Landing page's app mock-up**~~ | The window now has Daylily's own title strip (12b) and the sidebar as it ships: Home, Today, Calendar, Garden, Settings. Paper is in step with the site: the header's Changelog and Roadmap, the Download page's files. | Low | S | ✓ Done, Oct 25 |
| 12 | **End-to-end tests on the packaged app** | Playwright driving the real app: survive a force-quit mid-sentence, seal across 4am, sleep, a closed app and a time-zone change. Losing words is the worst bug Daylily can have. | High | L | Ready |
| 13 | ~~**Auto-update, checked on the splash**~~ | electron-updater on the GitHub releases: checks for a new version while the splash shows, then every six hours; Windows and the AppImage install on quit or with "Restart now"; macOS and the Debian package point to the download until macOS is signed. Paper 09f, 09g. First felt from 0.2.0: 0.1.0 can't update itself. | High | M | ✓ Done, Oct 25 |
| 14 | ~~**Polish pass**~~ | Walked every screen: a first run, an empty and a full journal, a very long page and title, dark mode, the smallest window (900 × 600), the keyboard (every control reachable, focus visible) and screen-reader names (every control and image named). Fixed: days before a journal began counted as rested (05g), garden numbers breaking in a narrow window, the ghost prompt's ellipsis wrapping alone, a quit that could hang with nothing to save. Not re-walked: the error states (04d, 04e), shipped and checked days ago. Still open: some faint text is below AA contrast, by design. | Medium | M | ✓ Done, Oct 25 |
| 15 | ~~**Search**~~ | Every page from ⌘K: an Orama index in memory, built from the files and kept current by the watcher; results as you type with the chosen day previewed, opened at the words (Paper 13a to 13c, CLAUDE.md §3.5). | High | L | ✓ Done, Oct 25 |
| 16 | **Onboarding** | Designed in Paper (10a to 10c): welcome, choose the journal folder, reminder time. §3.6: "write today's page within a minute". | High | M | Ready |
| 17 | ~~**Sidebar's journal item**~~ | No more dropdown arrow: it names the journal and its folder, and opens Settings › Journal (Paper 09f). | Low | S | ✓ Done, Oct 25 |
| 18 | ~~**Image quality audit**~~ | All 82 images measured against the size they're shown at. Eleven gallery covers were far too small for a day cover (388 to 800 px, most of them 388 px squares stretched 3.5×), the sample journal's too, and the README's app picture was a mock. The website's large paintings (hero meadow, dusk and its lilies, the manifesto lily, the changelog's path, the share card's meadow) were then upscaled 2× with Topaz. | Medium | S | ✓ Done, Oct 25 |
| 19 | ~~**Generate new image assets**~~ | The eleven covers painted again with Codex at 1536 × 1024, subject in the middle band, from the old ones as reference, then the long way home; the landing page's covers and the sample journal's 16 follow them, three of those (notebook, market, pancakes) painted anew. | Medium | M | ✓ Done, Oct 25 |
| 20 | ~~**More gallery covers**~~ | Twenty covers: eight new, also in the landing page's calendar, the sea, mountains, a forest, a garden, the moon, stars, a telescope under shooting stars and a rocket launch at dusk. The picker scrolls past four rows. | Medium | M | ✓ Done, Oct 25 |
| 21 | **Images on the page** | Pasted, dropped or chosen images, copied into the day's folder (`image-01.jpg`) and linked relatively, so the day stays plain markdown. Video, files and link previews moved to Later. | High | M | Ready |
| 22 | **Thoughts and notes** ⚠ | To discuss before anything is designed. Thoughts: quick notes through the day in a running stream; to keep the thesis they could belong to **today**, live in today's folder (`thoughts.md`) and seal with it at 4am. Notes: free-form, Obsidian-style, the biggest departure from "today is the only page". | Medium | M to XL | Blocked: discussion |
| 23 | **Sidebar by kind** | Journal, Thoughts, Notes, AI, Recent. Shaped by what 22 decides. | Low | S | After 22 |
| 24 | **Connections** | AI starts with **one** way in: an API key for one provider, or Sign in with ChatGPT. Keys live in the OS keychain, never in the journal. Off until turned on. | High | M | Blocked: which one first |
| 25 | **Ghost prompts that listen** | The pause question reacts to what you just wrote. Sees today's page only. The signature feature, upgraded. | High | M | After 24 |
| 26 | **Ask your journal** | "What made me happiest this spring?" Answers from your own pages, with a "this sends N days to …" note. Uses the search index (15) to pick pages. | High | L | After 24, 15 |

> **Search engines.** Algolia and similar hosted engines would send people's journals to a third party, which
> breaks "your files are yours" and offline use. In the app, search uses a local index: Orama, chosen over
> MiniSearch (no accent folding) and SQLite FTS5 (a native module per platform), held in memory and rebuilt from
> the files at launch. For a **docs site** later, a hosted or static engine is fine,
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
| **Video and files on the page** | Video and any file dropped on the page, copied into the day's folder (`video-01.mp4`, `file-01.pdf`) and linked relatively. Builds on images on the page. | Medium | M | After images on the page |
| **Link previews** | A pasted URL becomes a small card: title, site, picture. Stored as plain markdown (the link stays a link); the preview is fetched once and cached, and can be turned off. | Medium | M | Ready |
| **Diagrams and more markdown** | Mermaid diagrams, math (KaTeX), callouts, footnotes and highlights drawn on the page, all kept as plain text any editor can read. Sealed days render them too. | Medium | M | Ready |
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

- Buy `daylily.so` (5).
- Thoughts and notes: whether, and in what shape (22).
- The first AI connection: an API key for which provider, or Sign in with ChatGPT (24).
- When to pay for signing, and when Daylily is ready for 1.0.
