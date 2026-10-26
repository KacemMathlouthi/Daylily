import type { usePageEditor } from "@daylily/ui/editor/use-page-editor";
import { useEffect, useRef } from "react";
import { createStore } from "./store";

type Editor = ReturnType<typeof usePageEditor>;

/** The search dialog (Paper "13a"): opened from the sidebar, ⌘K or the Edit menu. */
const dialog = createStore(false);

export function useSearchDialog() {
  return [dialog.use(), dialog.set] as const;
}

export const openSearch = () => dialog.set(true);

/** A day opened from search carries what was searched for, to find it on the page. */
export function validateFind(search: Record<string, unknown>): {
  find?: string;
} {
  return typeof search.find === "string" && search.find.trim() !== ""
    ? { find: search.find }
    : {};
}

/** A thought opened from search: its day, its place in it, and what was searched for. */
export function validateFoundThought(search: Record<string, unknown>): {
  day?: string;
  find?: string;
  place?: number;
} {
  const { day, place } = search;
  return typeof day === "string" &&
    typeof place === "number" &&
    Number.isInteger(place) &&
    place >= 0
    ? { ...validateFind(search), day, place }
    : {};
}

/** A note opened from search: its file, and what was searched for. */
export function validateFoundNote(search: Record<string, unknown>): {
  find?: string;
  note?: string;
} {
  return typeof search.note === "string" && search.note !== ""
    ? { ...validateFind(search), note: search.note }
    : {};
}

/** The glow lasts two seconds and fades over 600ms, as in globals.css. */
const GLOW_MS = 2600;

function scrollParent(element: HTMLElement) {
  let parent = element.parentElement;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll") {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

/** Scrolls so the first marked word sits a third of the way down what holds it. */
export function revealFirstMatch(root: HTMLElement, smooth = true) {
  const match = root.querySelector<HTMLElement>(".search-match");
  const parent = match && scrollParent(match);
  if (!(match && parent)) {
    return;
  }
  const offset =
    match.getBoundingClientRect().top - parent.getBoundingClientRect().top;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  parent.scrollTo({
    behavior: smooth && !reduced ? "smooth" : "auto",
    top: parent.scrollTop + offset - parent.clientHeight / 3,
  });
}

/**
 * Opens a page at what was searched for (Paper "13c"): scrolled to the first
 * match, in its title or its page, which glows and fades. Then `onDone`, which
 * takes `find` away, so the page reopened later (another app changed the file,
 * the day sealed) doesn't glow again.
 */
export function useFindOnPage(
  editor: Editor,
  find: string | undefined,
  { writing = false, onDone }: { writing?: boolean; onDone: () => void }
) {
  // Read when the page opens, not followed: the seal at 4am must not replay it
  const writingRef = useRef(writing);
  writingRef.current = writing;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!find) {
      return;
    }
    editor.commands.setSearchHighlight(find, "glow");
    if (writingRef.current) {
      // The cursor goes back to the end, ready to write; the page scrolls to the match instead
      editor.commands.focus("end", { scrollIntoView: false });
    }
    // The title is outside the editor, so the whole page is searched for the first mark
    const page = editor.view.dom.closest("article") ?? editor.view.dom;
    const frame = requestAnimationFrame(() => revealFirstMatch(page));
    const timer = setTimeout(() => {
      editor.commands.setSearchHighlight("");
      doneRef.current();
    }, GLOW_MS);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [editor, find]);
}
