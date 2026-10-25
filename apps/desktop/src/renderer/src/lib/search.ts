import type { usePageEditor } from "@daylily/ui/editor/use-page-editor";
import { useEffect } from "react";
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
 * match, which glows and fades. The glow is then cleared, so writing on today's
 * page never replays it.
 */
export function useFindOnPage(
  editor: Editor,
  find: string | undefined,
  { writing = false } = {}
) {
  useEffect(() => {
    if (!find) {
      editor.commands.setSearchHighlight("");
      return;
    }
    editor.commands.setSearchHighlight(find, "glow");
    if (writing) {
      // The cursor goes back to the end, ready to write; the page scrolls to the match instead
      editor.commands.focus("end", { scrollIntoView: false });
    }
    const frame = requestAnimationFrame(() =>
      revealFirstMatch(editor.view.dom)
    );
    const timer = setTimeout(
      () => editor.commands.setSearchHighlight(""),
      GLOW_MS
    );
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [editor, find, writing]);
}
