<p align="center">
  <img alt="Daylily. A journal for your whole day, in your own words: thoughts as they come, notes you keep, and one page each evening that seals at 4am and grows into a garden." src=".github/readme/hero.webp" width="880">
</p>

<p align="center">
  <a href="https://daylily.ink/download/mac"><img alt="Download for macOS" src=".github/readme/download-macos.png" height="44"></a>
  <a href="https://daylily.ink/download/windows"><img alt="Download for Windows" src=".github/readme/download-windows.png" height="44"></a>
  <a href="https://daylily.ink/download/linux"><img alt="Download for Linux" src=".github/readme/download-linux.png" height="44"></a>
</p>

<p align="center">
  Free and open source ·
  <a href="https://daylily.ink/changelog">Changelog</a> ·
  <a href="https://daylily.ink/roadmap">Roadmap</a> ·
  <a href="https://daylily.ink/privacy">Privacy</a> ·
  <a href="https://daylily.ink">Website</a>
</p>

Daylily is a journal for your whole day, in your own words. Jot thoughts as they come, keep notes you change, and each
evening write one page about how it went. At 4am the page seals, honest and unedited, and a flower opens in your
garden.

Most journaling apps want to write your journal *for* you. **Daylily goes the other way:** it asks, it listens, and
every word stays yours, in plain markdown files on your computer.

<p align="center">
  <img alt="Daylily's writing screen: the sidebar with Home, the Journal (Today, Calendar, Garden) and the Notebook (Thoughts, Notes), and today's page, The long way home, with a cover of daylilies on a hillside at sunset, three short paragraphs, and a faint question at the end of the last line: …what surprised you today?" src=".github/readme/app.webp" width="880">
</p>

## A day with Daylily

From a thought in the morning to a garden years later. Each one has its own page on the website.

<p align="center">
  <a href="https://daylily.ink/features/thoughts"><img alt="Thoughts: write anything down the moment it comes, under the time it came." src=".github/readme/feature-thoughts.webp" width="49%"></a>
  <a href="https://daylily.ink/features/notes"><img alt="Notes: the back pages, lists and plans you keep and change, pinned on top." src=".github/readme/feature-notes.webp" width="49%"></a>
  <a href="https://daylily.ink/features/journaling"><img alt="Journaling: one page a day, in your own words. At 4am it seals, honest and unedited, like ink." src=".github/readme/feature-journaling.webp" width="49%"></a>
  <a href="https://daylily.ink/features/ghost-prompts"><img alt="Ghost prompts: when you pause, a quiet question fades in. Never words you can accept." src=".github/readme/feature-ghost-prompts.webp" width="49%"></a>
  <a href="https://daylily.ink/features/garden"><img alt="Garden and calendar: every day you write becomes a flower, and its cover fills a calendar like a photo album." src=".github/readme/feature-garden.webp" width="49%"></a>
  <a href="https://daylily.ink/features/search"><img alt="Search: find any word in any day, thought or note, from Ctrl + K. All of it offline." src=".github/readme/feature-search.webp" width="49%"></a>
</p>

<p align="center">
  <img alt="" src=".github/readme/divider.png" width="880">
</p>

## What Daylily believes

1. **Written by you.** Every word is yours. When AI comes, it asks and answers; it never writes, rewrites or
   summarises into your journal, and it's off until you turn it on.
2. **Kept by you.** Plain markdown in a folder you own, readable in any app and in twenty years. Each page seals at
   4am, like ink. Nothing leaves your computer unless you choose.
3. **Grown into a garden.** Every day you write plants a flower. A missed day is bare soil, never guilt.

The full story is in the [manifesto](https://daylily.ink/manifesto), and what leaves your computer (almost nothing)
is on the [privacy page](https://daylily.ink/privacy).

## Your journal is a folder

One folder per day, holding the page, its thoughts and its pictures, and one file for each note. Open them in any
editor, grep them, sync them with anything, or read them in twenty years.

```
~/Daylily/
  2026/10/26/
    2026-10-26.md        # the page: title, cover, the day in markdown
    thoughts.md          # the day's thoughts, each under its time
    cover.jpg
    image-01.jpg
  notes/
    books-to-read.md     # one file per note, named from its title
    images/
  .daylily/config.json   # your reminder time and preferences
```

## Install

Download the latest release for your computer from the [download page](https://daylily.ink/download) or
[GitHub Releases](https://github.com/KacemMathlouthi/Daylily/releases/latest).

| System | File | First launch |
|---|---|---|
| macOS 13 or later | [Apple silicon](https://daylily.ink/download/mac) · [Intel](https://daylily.ink/download/mac-intel) `.dmg` | Drag Daylily to Applications, then right-click it and choose **Open** |
| Windows 10 or later | [`setup.exe`](https://daylily.ink/download/windows) | **More info**, then **Run anyway** |
| Linux | [`.AppImage`](https://daylily.ink/download/linux) · [`.deb`](https://daylily.ink/download/deb) | `chmod +x` the AppImage and run it, or `sudo apt install ./daylily_*.deb` |

> [!NOTE]
> Builds aren't signed yet, so macOS and Windows warn you the first time. If macOS still refuses, run
> `xattr -cr /Applications/Daylily.app`. Signed builds are on the roadmap. Each release lists its
> [checksums](https://daylily.ink/download/checksums).

## Build it yourself

Daylily is an Electron app in a pnpm monorepo. You need Node 24 and pnpm.

```sh
git clone https://github.com/KacemMathlouthi/Daylily
cd Daylily
pnpm install
pnpm dev              # the app and the website
pnpm journal:seed     # optional: a sample year and a half of days in ~/Daylily
```

- `apps/desktop`: the Electron app
- `apps/web`: the website
- `packages/core`: days, sealing and flowers, with no UI
- `packages/ui`: the design system and the page editor

Want to help? Start with [CONTRIBUTING.md](CONTRIBUTING.md).

## Where it's growing

The same day, a little further.

- **Through the day, everywhere:** Daylily on your phone, and sync through git, your own bucket or a hosted option.
- **In the evening:** ghost prompts that listen to what you just wrote.
- **Over the years:** look-backs from weekly to yearly, ask your journal, a year in review, a printed book of a year.
- **Always:** export, and a journal you can lock.

AI arrives as a companion: off until you turn it on, any provider or a model on your own computer, and plain about
what it sends. See the [roadmap](https://daylily.ink/roadmap) and the [changelog](https://daylily.ink/changelog), and
[suggest a change](https://github.com/KacemMathlouthi/Daylily/issues/new?template=suggestion.yml) anytime.

## License

[AGPL-3.0](LICENSE). Free and open source, now and always.

<p align="center">
  <img alt="How was your day? Tonight is a good night to start." src=".github/readme/closing.webp" width="880">
</p>
