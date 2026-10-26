import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { FLOWER_CLASS } from "@daylily/ui/components/garden";
import { PageContent } from "@daylily/ui/components/page-content";
import { usePageEditor } from "@daylily/ui/editor/use-page-editor";
import { cn } from "@daylily/ui/lib/cn";
import {
  Command,
  CommandBareInput,
  CommandItem,
  CommandList,
} from "@daylily/ui/primitives/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@daylily/ui/primitives/dialog";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { FileText, Search } from "lucide-react";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type DayHit,
  journalAssetUrl,
  MAX_QUERY_LENGTH,
  MAX_SEARCH_HITS,
  type NoteHit,
  type SearchHit,
  type ThoughtHit,
} from "../../../../shared/journal";
import { usePastDay } from "../../lib/days";
import { dateFormat } from "../../lib/format";
import { fromKey, todayKey } from "../../lib/month";
import { shownImages, shownNoteImages } from "../../lib/page-images";
import { revealFirstMatch, useSearchDialog } from "../../lib/search";
import { changedOn } from "../notes/when";
import { MOD_KEY, Shortcut } from "../shortcut";
import { Marked } from "./marked";

const HIT_DATE = dateFormat({
  day: "numeric",
  month: "long",
  weekday: "short",
  year: "numeric",
});
const PREVIEW_DATE = dateFormat({
  day: "numeric",
  month: "long",
  weekday: "long",
  year: "numeric",
});

function HitCover({ hit }: { hit: DayHit }) {
  return hit.cover ? (
    <img
      alt=""
      className="h-11 w-15 shrink-0 rounded-lg object-cover"
      height={88}
      src={journalAssetUrl(hit.day, hit.cover)}
      width={120}
    />
  ) : (
    <span className="flex h-11 w-15 shrink-0 items-center justify-center rounded-lg bg-paper-sunk">
      <DaylilyMark className={FLOWER_CLASS[hit.color ?? "daylily"]} size={16} />
    </span>
  );
}

/** When a result is from: "Today · Tue, October 20, 2026". */
function hitDate(day: string, today: string) {
  const date = HIT_DATE.format(fromKey(day));
  return day === today ? `Today · ${date}` : date;
}

/** A thought found (Paper 13d): its time where a day has its cover, then its words. */
function ThoughtResult({ hit, today }: { hit: ThoughtHit; today: string }) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className="flex h-11 w-15 shrink-0 items-center justify-center rounded-lg border border-line bg-paper-page font-display text-ink text-lede leading-5.5 tracking-snug">
        {hit.time ?? "·"}
      </span>
      <div className="flex min-w-0 flex-col gap-1 pt-px">
        <span className="font-semibold text-ink-faint text-meta uppercase tracking-caps">
          Thought · {hitDate(hit.day, today)}
        </span>
        <span className="line-clamp-2 font-writing text-body-sm text-ink-2 leading-5.25">
          <Marked marks={hit.snippet.marks} text={hit.snippet.text} />
        </span>
      </div>
    </div>
  );
}

/** A note found (Paper 17d): a page's tile where a day has its cover, then its title and words. */
function NoteResult({ hit, query }: { hit: NoteHit; query: string }) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className="flex h-11 w-15 shrink-0 items-center justify-center rounded-lg border border-line bg-paper-page">
        <FileText className="size-4.5 text-ink-muted" strokeWidth={1.6} />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-semibold text-ink-faint text-meta uppercase tracking-caps">
          Note · changed {changedOn(hit.updated, new Date())}
        </span>
        <span className="truncate font-display text-ink text-lede leading-5.5">
          <Marked query={query} text={hit.title || "Untitled"} />
        </span>
        <span className="line-clamp-2 text-ink-muted text-ui leading-4.5">
          <Marked marks={hit.snippet.marks} text={hit.snippet.text} />
        </span>
      </div>
    </div>
  );
}

function Hit({
  hit,
  query,
  today,
}: {
  hit: SearchHit;
  query: string;
  today: string;
}) {
  if (hit.kind === "thought") {
    return <ThoughtResult hit={hit} today={today} />;
  }
  if (hit.kind === "note") {
    return <NoteResult hit={hit} query={query} />;
  }
  const title = hit.title || "Untitled";
  const when = hitDate(hit.day, today);
  return (
    <div className="flex min-w-0 gap-3">
      <HitCover hit={hit} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-semibold text-ink-faint text-meta uppercase tracking-caps">
          {when}
        </span>
        <span className="truncate font-display text-ink text-lede leading-5.5">
          <Marked query={query} text={title} />
        </span>
        <span className="line-clamp-2 text-ink-muted text-ui leading-4.5">
          <Marked marks={hit.snippet.marks} text={hit.snippet.text} />
        </span>
      </div>
    </div>
  );
}

/** The chosen day beside the results, its page marked where the words are. */
function Preview({ day, query }: { day: string; query: string }) {
  const page = usePastDay(day);
  const markdown = page.kind === "written" ? page.markdown : "";
  // The images of whichever day is chosen: the editor reads them through a ref
  const images = useMemo(() => shownImages(day), [day]);
  const editor = usePageEditor({ content: markdown, editable: false, images });

  useEffect(() => {
    editor.commands.setContent(markdown, { contentType: "markdown" });
    editor.commands.setSearchHighlight(query);
    const frame = requestAnimationFrame(() =>
      revealFirstMatch(editor.view.dom, false)
    );
    return () => cancelAnimationFrame(frame);
  }, [editor, markdown, query]);

  if (page.kind !== "written") {
    return null;
  }
  return (
    <div className="relative min-w-0 flex-1 overflow-y-auto px-7 pt-5.5 pb-16">
      {page.cover ? (
        <img
          alt={page.cover.label}
          className="h-30 w-full rounded-xl object-cover"
          height={1024}
          src={page.cover.url}
          width={1536}
        />
      ) : null}
      <div className="flex flex-col gap-1.5 pt-3.5">
        <p className="font-medium text-ink-subtle text-xs tracking-label">
          {PREVIEW_DATE.format(fromKey(day))} · {page.words}{" "}
          {page.words === 1 ? "word" : "words"}
        </p>
        {page.title ? (
          <h2 className="font-display text-ink text-title leading-9.5 tracking-title">
            {page.title}
          </h2>
        ) : null}
      </div>
      <PageContent
        className="pt-3.5 text-body text-ink-2 leading-6.75"
        editor={editor}
      />
    </div>
  );
}

/** The chosen result, beside the list: a day's page, a thought or a note. */
function HitPreview({ hit, query }: { hit: SearchHit; query: string }) {
  switch (hit.kind) {
    case "day":
      return <Preview day={hit.day} key={hit.id} query={query} />;
    case "thought":
      return <ThoughtPreview hit={hit} key={hit.id} query={query} />;
    default:
      return <NotePreview hit={hit} key={hit.id} query={query} />;
  }
}

const KINDS = [
  ["day", "day", "days"],
  ["thought", "thought", "thoughts"],
  ["note", "note", "notes"],
] as const;

/** "2 DAYS · 1 THOUGHT · 1 NOTE": what was found, each kind counted apart. */
function foundLabel(hits: SearchHit[], more: boolean) {
  const parts = KINDS.flatMap(([kind, one, many]) => {
    const count = hits.filter((hit) => hit.kind === kind).length;
    return count > 0 ? [`${count} ${count === 1 ? one : many}`] : [];
  });
  return `${parts.join(" · ")}${more ? " and more" : ""}`;
}

/** The chosen note beside the results (Paper 17d): its title, when it changed, its words marked. */
function NotePreview({ hit, query }: { hit: NoteHit; query: string }) {
  const { data } = useQuery({
    queryFn: () => window.daylily.notes.read(hit.name),
    // Read again when the note has changed since
    queryKey: ["journal", "note", hit.name, hit.updated],
  });
  const markdown = data?.ok ? (data.value?.body ?? "") : "";
  const images = useMemo(() => shownNoteImages(), []);
  const editor = usePageEditor({ content: markdown, editable: false, images });

  useEffect(() => {
    editor.commands.setContent(markdown, { contentType: "markdown" });
    editor.commands.setSearchHighlight(query);
    const frame = requestAnimationFrame(() =>
      revealFirstMatch(editor.view.dom, false)
    );
    return () => cancelAnimationFrame(frame);
  }, [editor, markdown, query]);

  return (
    <div className="relative min-w-0 flex-1 overflow-y-auto px-7 pt-7.5 pb-16">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-ink text-title-sm leading-8.5 tracking-snug">
          {hit.title || "Untitled"}
        </h2>
        <span className="text-ink-muted text-ui leading-4.5">
          A note · changed {PREVIEW_DATE.format(new Date(hit.updated))}
        </span>
      </div>
      <PageContent
        className="pt-4.5 text-body text-ink-2 leading-6.75"
        editor={editor}
      />
    </div>
  );
}

/** The chosen thought beside the results (Paper 13d): its time, its day, its words marked. */
function ThoughtPreview({ hit, query }: { hit: ThoughtHit; query: string }) {
  const { data } = useQuery({
    queryFn: () => window.daylily.thoughts.read(hit.day),
    queryKey: ["journal", "thoughts-of", hit.day],
  });
  const thought = data?.state === "ok" ? data.thoughts[hit.index] : undefined;
  const markdown = thought?.body ?? "";
  const images = useMemo(() => shownImages(hit.day), [hit.day]);
  const editor = usePageEditor({ content: markdown, editable: false, images });

  useEffect(() => {
    editor.commands.setContent(markdown, { contentType: "markdown" });
    editor.commands.setSearchHighlight(query);
    const frame = requestAnimationFrame(() =>
      revealFirstMatch(editor.view.dom, false)
    );
    return () => cancelAnimationFrame(frame);
  }, [editor, markdown, query]);

  return (
    <div className="relative min-w-0 flex-1 overflow-y-auto px-7 pt-7.5 pb-16">
      <div className="flex flex-col gap-1.5">
        <span className="font-display text-ink text-title-sm leading-8.5 tracking-snug">
          {hit.time ?? "·"}
        </span>
        <span className="text-ink-muted text-ui leading-4.5">
          {PREVIEW_DATE.format(fromKey(hit.day))} · a thought
        </span>
      </div>
      <PageContent
        className="pt-4.5 text-body text-ink-2 leading-6.75"
        editor={editor}
      />
    </div>
  );
}

/** The days, thoughts and notes found, the chosen one previewed beside them, and how to move through them. */
function Results({
  chosen,
  hits,
  more,
  onOpen,
  preview,
  query,
  today,
}: {
  chosen: string;
  hits: SearchHit[];
  /** More matched than are listed. */
  more: boolean;
  onOpen: (id: string) => void;
  preview: boolean;
  query: string;
  today: string;
}) {
  const chosenHit = hits.find((hit) => hit.id === chosen);
  return (
    <>
      <div className="flex h-[min(33.5rem,calc(88vh-8rem))] min-h-0">
        <CommandList
          className={cn(
            "max-h-none shrink-0 p-2.5",
            preview ? "w-95 border-line border-r" : "flex-1"
          )}
        >
          <p className="px-2.5 pt-2 pb-1.5 font-semibold text-ink-faint text-meta uppercase tracking-caps">
            {foundLabel(hits, more)}
          </p>
          {hits.map((hit) => (
            <CommandItem
              className="rounded-xl! p-2.5 data-selected:bg-paper-sunk [&>svg:last-child]:hidden"
              key={hit.id}
              onSelect={onOpen}
              value={hit.id}
            >
              <Hit hit={hit} query={query} today={today} />
            </CommandItem>
          ))}
        </CommandList>
        {preview && chosenHit ? (
          <HitPreview hit={chosenHit} query={query} />
        ) : null}
      </div>
      <div className="flex items-center justify-between border-line border-t px-5 py-2.5 text-ink-faint text-xs">
        <span className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <Shortcut keys={["↑"]} />
            <Shortcut keys={["↓"]} />
            to move
          </span>
          <span className="flex items-center gap-1.5">
            <Shortcut keys={["Enter"]} />
            to open it
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <Shortcut keys={[MOD_KEY, "J"]} />
          {preview ? "hides the preview" : "shows the preview"}
        </span>
      </div>
    </>
  );
}

/**
 * Search every page, thought and note you've written (Paper "13a", "13b",
 * "13d", "17d"): opened with ⌘K from anywhere, results as you type, best
 * first, the chosen one previewed beside them. Enter opens the day, the
 * thought on the Thoughts screen, or the note, at the first match.
 */
export function SearchDialog() {
  const [open, setOpen] = useSearchDialog();
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState("");
  const [preview, setPreview] = useState(true);
  const navigate = useNavigate();
  const today = todayKey(new Date());
  const searching = query.trim() !== "";

  const { data: hits, isPlaceholderData } = useQuery({
    enabled: open && searching,
    placeholderData: keepPreviousData,
    queryFn: () => window.daylily.journal.search(query),
    queryKey: ["journal", "search", query],
  });
  const found = searching ? (hits ?? []) : [];
  const shown = found.slice(0, MAX_SEARCH_HITS);
  const more = found.length > shown.length;

  // The first result is chosen as results arrive, unless the chosen one is still there
  useEffect(() => {
    if (!shown.some((hit) => hit.id === chosen)) {
      setChosen(shown[0]?.id ?? "");
    }
  }, [shown, chosen]);

  const changeOpen = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) {
        setQuery("");
      }
    },
    [setOpen]
  );

  // Opening a day hands focus to its page, not back to what opened search
  const openedDay = useRef(false);
  const finalFocus = useCallback(() => !openedDay.current, []);
  useEffect(() => {
    if (open) {
      openedDay.current = false;
    }
  }, [open]);

  const openHit = useCallback(
    (id: string) => {
      const hit = shown.find((each) => each.id === id);
      // Results for an earlier query are still on screen for a moment; wait for the new ones
      if (isPlaceholderData || !hit) {
        return;
      }
      openedDay.current = true;
      changeOpen(false);
      const find = query.trim();
      if (hit.kind === "note") {
        navigate({ search: { find, note: hit.name }, to: "/notes" });
      } else if (hit.kind === "thought") {
        navigate({
          search: { day: hit.day, find, place: hit.index },
          to: "/thoughts",
        });
      } else if (hit.day === today) {
        navigate({ search: { find }, to: "/today" });
      } else {
        navigate({
          params: { key: hit.day },
          search: { find },
          to: "/day/$key",
        });
      }
    },
    [changeOpen, isPlaceholderData, navigate, query, shown, today]
  );

  const togglePreview = useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "j") {
      event.preventDefault();
      setPreview((shownNow) => !shownNow);
    }
  }, []);

  const nothingFound =
    searching && hits !== undefined && !isPlaceholderData && shown.length === 0;

  return (
    <Dialog onOpenChange={changeOpen} open={open}>
      <DialogContent
        className="top-[12vh] flex w-[calc(100%-4rem)] max-w-230 translate-y-0 flex-col gap-0 overflow-hidden rounded-panel border border-line bg-paper-page p-0 text-ink shadow-panel ring-0 sm:max-w-230"
        finalFocus={finalFocus}
        overlayClassName="bg-ink/16 supports-backdrop-filter:backdrop-blur-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <Command
          className="rounded-none! bg-transparent p-0"
          loop
          onKeyDown={togglePreview}
          onValueChange={setChosen}
          shouldFilter={false}
          value={chosen}
        >
          <div className="flex items-center gap-3 border-line border-b px-5 py-4.5">
            <Search
              aria-hidden="true"
              className="size-4.5 shrink-0 text-ink-subtle"
              strokeWidth={2}
            />
            <CommandBareInput
              className="bg-transparent text-ink text-lg caret-daylily placeholder:text-ink-ghost"
              maxLength={MAX_QUERY_LENGTH}
              onValueChange={setQuery}
              placeholder="Search your days, thoughts and notes"
              value={query}
            />
            <Shortcut keys={["Esc"]} />
          </div>

          {searching ? null : (
            <p className="px-5 pt-5.5 pb-6 text-ink-subtle text-ui-lg">
              Search every page, thought and note you’ve written, by its words.
            </p>
          )}
          {nothingFound ? (
            <p className="px-5 pt-5.5 pb-6 text-ink-subtle text-ui-lg">
              Nothing you’ve written mentions “{query.trim()}” yet.
            </p>
          ) : null}

          {shown.length > 0 ? (
            <Results
              chosen={chosen}
              hits={shown}
              more={more}
              onOpen={openHit}
              preview={preview}
              query={query}
              today={today}
            />
          ) : null}
        </Command>
      </DialogContent>
    </Dialog>
  );
}
