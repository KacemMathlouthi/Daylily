# Daylily — Vision

> *One page a day. Written by you, kept by you, grown into a garden.*

**Status:** idea / vision, captured 2026-10-19. Not started.
**Business model:** undecided — open-source, open-core, or commercial (see [Open questions](#open-questions)).

---

## The thesis

Most journaling apps are trying to write your journal *for* you, through AI summaries, chat-to-entry and auto-titles.
Daylily goes the other way. **It's a human-first journal.** The app's whole job is to get you to sit down
every day and say what happened and how it felt, in your own words. Broken grammar, typos and unfinished
thoughts all count, because they're true.

Four ideas hold it together:

1. **One page per day.** Today is the only page you can write. At midnight it seals and becomes part of your
   history, honest and unedited, like ink in a paper journal.
2. **The app nudges you to keep going.** It opens on *"How was your day?"*, and when you pause it whispers
   *"…and how did you feel about that?"* Its job is to draw more out of you.
3. **Your days grow into a garden.** Every day you write plants a flower. Over months the garden becomes a
   picture of your life that you can stroll through.
4. **The files and the AI are yours.** Days are plain markdown files in a folder you own, synced however you like.
   AI is off unless you turn it on, feature by feature, using whatever model you choose. **The AI never writes for you.**

---

## Core experience

### The daily page
- The opening screen asks a warm question, *"How was your day?"*, and the cursor is already in place. No clutter.
- A calm, editorial markdown editor (Tiptap-class) set in serif type with generous margins. It should feel like paper, not a form.
- **Today only.** Past days are read-only. At local midnight the page seals.
  - Possible later idea, not decided: attach a dated *"looking back…"* note to a sealed day without changing the
    original text. This would fit retrospection well.
- Each day has a **title** and **one cover image** (uploaded or AI-generated). The cover represents the day in the calendar.
- Any other media goes inline in the page: more images, voice notes, video, files.

### Nudges (the "ghost prompts")
- When you stop typing, faint text fades in where the cursor is: *"and how did you feel about that?"*,
  *"what do you want to do about it?"*, *"who else was there?"*
- **These are AI-powered and contextual.** They react to what you just wrote, and they only appear if the AI
  nudges feature is enabled.
- They're questions, never sentences you can accept. You can't tab-complete them and you can't insert them.
  They disappear the moment you type.
- Prior-art check (Oct 2026): we couldn't find any app that shows *inline, automatic, on-pause* reflective
  prompts. Day One's "Go Deeper" and similar features need you to tap a button. **This is the signature
  interaction.**

### The garden
- **Each written day becomes a flower.** Its shape, size and color could come from how long the entry is,
  how deep it goes, or its mood (to be designed).
- A missed day leaves **bare soil**. There are no punishments: no wilting, no streak shaming, no guilt.
  The brand is about welcoming you back.
- The garden is the main screen you return to. It's a living picture of how much you've written.

### Calendar & graph
- A **calendar** where each day shows its title and cover image, so scrolling back through months feels
  like flipping through a photo album of your life.
- A **contribution graph** (GitHub-style) for at-a-glance participation. It shares a data source with the
  garden but gives a denser view.

---

## AI: optional and never the author

**Principle:** AI may *ask*, *answer* and *illustrate*. It **never writes your journal.**

Every AI feature can be turned on or off separately:

| Feature | What it does |
|---|---|
| Ghost prompts | Contextual nudges when you pause |
| Ask your journal | "What made me happiest this spring?" "What keeps going wrong at work?" |
| Retrospectives | Weekly, monthly and yearly look-backs: what went right, what went wrong, patterns |
| Cover image generation | Generate a day's cover from its text (only when you ask) |

**How the AI connects (all supported):**
- **Bring your own API key** (Anthropic, OpenAI, …)
- **Local models** (Ollama or similar). Entries never leave the machine.
- **Sign in with ChatGPT**, so people can use their existing plan. This became available to third-party apps
  in late Sept 2026.
- **Embedded terminal.** Run Claude Code, Codex or any agent CLI directly on your journal folder. This works
  because the journal is just files.
- **Hosted subscription**, possibly later, if a paid tier happens.

---

## Data & sync

- **Plain markdown on disk.** Something like `journal/2026/10/2026-10-19.md` plus a media folder, with
  frontmatter for the title, cover and seal state. You can open it in Obsidian, grep it, or read it in
  20 years. No lock-in.
- **Sync is pluggable:** git, Google Drive, S3-compatible buckets, iCloud/Dropbox folders, or nothing at all.
- **Sealing is a convention on top of plain files.** The app enforces it, and it could also be backed up by
  something you can check: a git commit at midnight, or a content hash stored in the frontmatter.
  Expect people to edit the files outside the app. Trust over enforcement.

---

## Codexes (beyond the core)

On top of the daily journal you can write **unlimited long-form pieces**, called *codexes*: essays, stories,
lessons, letters.
- Private by default.
- One click publishes it to a **hosted public garden** (e.g. `daylily.<tld>/@you/slug`), a reading page with the
  same editorial look, Medium/Substack-style.

> ⚠️ Research flag: this competes with Substack, Medium, Write.as and Day One Publish, and it pulls focus away
> from the daily-journal thesis. Keep it **out of v1**. It's also a natural paid feature if the project goes
> open-core.

---

## Brand

- **Feel:** a warm, unhurried, welcoming, editorial place in nature. In the spirit of Anthropic's visual
  language: serif headlines, warm off-white paper, earthy tones, hand-drawn botanical illustration. No neon,
  no glassmorphism, no gamified confetti.
- **Name:** Daylily. Daylilies (*Hemerocallis*, Greek for "beauty for a day") bloom for exactly one day, and a new flower opens the next morning. That is the one-page-a-day rule as a flower. Checked Oct 2026: no journaling or software collisions, and npm `daylily` is free. Domains: `daylily.so` looks free, `daylily.app` and `getdaylily.com` look parked (check whether they can be bought), `daylilyjournal.com` is taken. The bare GitHub org is taken, so use something like `daylily-app`. A USPTO/EUIPO trademark search has not been done yet.
- **Logo:** a single daylily (six-petaled trumpet bloom). Simple enough to work as a 16px favicon and as an embossed mark.
- **Voice:** a kind friend who listens and never lectures. *"How was your day?"* rather than *"Log your entry."*
  Missing a day gets *"Welcome back"*, never *"You broke your streak."*
- **Type:** an editorial serif for headings and writing (e.g. Newsreader, Source Serif, Fraunces), plus a
  humanist sans for the UI chrome.
- **Palette direction:** paper cream, ink brown-black, moss green, terracotta, petal pink as the accent.

---

## Platforms

- **Desktop first** (macOS, Windows, Linux). Obsidian is the reference point for feel and ownership.
- Then web and mobile. Mobile matters a lot for a daily ritual (writing in bed), so the stack should allow for it.
- **Stack: Electron** (decided 2026-10-19). The UI is React + TypeScript (Tiptap editor), and the backend is the
  Node main process (TypeScript).
  - *Why:* type renders identically on every OS (the brand depends on serif typography); the embedded terminal is
    easy with xterm.js + node-pty (what VS Code uses); it's one language end to end; and it's Obsidian's proven path.
  - *Mobile later:* a Capacitor shell that reuses the same React UI, as Obsidian does.
  - *Don't get locked in:* keep all platform code behind a thin storage/OS interface (`readDay`, `writeToday`,
    `sealDay`, `listDays`, …). Then moving to Tauri later, or shipping a web version, only means writing a new
    adapter.
  - *Trade-off accepted:* app size (~100MB+) and memory use.

---

## Landscape (researched Oct 2026)

**Almost every feature exists somewhere on its own. The combination doesn't.**

| Feature | Already exists in |
|---|---|
| Local markdown + git/S3/Drive sync, heatmaps, agent terminal | Obsidian + plugins (Obsidian Git, Remotely Save, Calendar Heatmap, Blackglass/Claudian terminals) |
| AI "go deeper" prompts, AI images, publishing | Day One (Gold tier, 2026), but cloud-based, closed, and its AI co-writes |
| Sealing past days | **at8pm** (iOS, Sept 2026): days lock at a chosen hour. Lightmark makes entries immutable |
| Calendar of daily photos | Journey, Day One |
| AI retrospection over entries | Rosebud, Mindsera, Day One |
| Garden / flower per entry | Gratitude Garden, One Year Daily Journal, Garden of You; Forest/Finch for habits |

**What looks unclaimed:**
- **Inline ghost prompts that appear automatically on pause.** We didn't find this shipped anywhere.
- **A hard "AI never writes" stance.** Competitors all generate or co-write. This sets the positioning apart,
  though the technology isn't new.
- **The combination:** a journal-specific desktop app (not a general notes app) built on files you own,
  with today as the only writable page, opt-in AI from any provider, and a garden.

**Honest take:** the hook is the principles, not the features. *Your files, today only, AI that asks but
never writes.* The garden is the expected visual layer, not a moat. We'd be second to at8pm on sealing.

---

## Not doing

- AI that writes, rewrites, autocompletes, "fixes grammar" in or summarizes *into* your entry.
- Streak punishment, wilting plants, guilt notifications.
- A proprietary database you can't read without the app.
- A social feed. Codexes are published pages, not a network.

---

## Open questions

- **Business model:** fully OSS vs. open-core (paid: hosted AI, sync, codex publishing) vs. commercial.
- **Time zones and travel:** when exactly does a page seal? Local midnight? What about a late-night grace window?
- **Ghost prompts are AI-only.** That means the signature interaction disappears for people who turn AI off.
  Is that acceptable, or should there be a small offline fallback?
- **Flower mapping:** what decides each flower (length, mood, cover colors, tags)?
- ~~**Stack:** Tauri vs. Electron.~~ Decided: Electron (see Platforms).
- **Encryption:** encrypt the files at rest? This conflicts with "plain markdown" and needs a careful design.
- **Codex timing:** when, if ever, and is it the paid feature?
- **Notes on sealed days:** can you attach a dated *"looking back…"* note to a past day without changing the
  original? It suits retrospection well.
- **Daily reminders:** a gentle evening "How was your day?" notification at a time you choose, or none at all?
  It needs to fit the "no guilt" principle.
- **Importing:** bring in existing journals from Day One, Obsidian daily notes or plain markdown? Imported past
  days would arrive already sealed.
- **Search:** plain full-text search across all days, or only "ask your journal" through AI?
- **Privacy defaults for cloud AI:** which entries get sent to a cloud model (only today's page vs. everything
  for retrospectives)? It needs a clear, honest setting.
- **One journal or several:** a single life journal, or separate ones (work, travel)? A single journal fits
  "one page a day" best.
- **Domain & trademark:** buy `daylily.so` / check whether `daylily.app` can be bought; run a USPTO/EUIPO
  trademark search.

---

## Possible v1 scope

1. Daily page editor, today only, sealing at midnight, markdown files on disk
2. Opening prompt + title + cover image
3. Garden view + calendar + contribution graph
4. AI settings: BYO key + Ollama; ghost prompts as the first AI feature
5. Git-folder sync (a file folder synced by anything works out of the box)

Later: ask-your-journal, retrospectives, image generation, embedded terminal, ChatGPT sign-in, mobile, codexes.
