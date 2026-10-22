import { Extension } from "@tiptap/core";
import { type EditorState, Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface GhostPromptsOptions {
  /** Classes for the faint question, so its look stays with the component that renders it. */
  className: string;
  /** How long a pause, in ms, before a question fades in. */
  delay: number;
  /** Whether questions start on; `setGhostPrompts` changes it later. */
  enabled: boolean;
  /** The questions to choose from. Never the same one twice in a row. */
  prompts: readonly string[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    ghostPrompts: {
      /** Turns the nudges on or off without rebuilding the editor. */
      setGhostPrompts: (enabled: boolean) => ReturnType;
    };
  }
}

interface GhostState {
  enabled: boolean;
  /** The last question shown, so the next one differs. */
  last: string | null;
  /** The question showing, and where; null while the writer is typing. */
  shown: { text: string; pos: number } | null;
}

type GhostMeta =
  | { type: "show"; text: string; pos: number }
  | { type: "hide" }
  | { type: "enable"; enabled: boolean };

const ghostKey = new PluginKey<GhostState>("ghostPrompts");

/** Only at the end of a line of writing, where a question can't cover the words after it. */
function promptPosition(state: EditorState) {
  const { selection, doc } = state;
  if (!selection.empty || doc.textContent.trim() === "") {
    return null;
  }
  const { $head } = selection;
  const atLineEnd =
    $head.parent.isTextblock &&
    $head.parent.textContent.trim() !== "" &&
    $head.parentOffset === $head.parent.content.size;
  return atLineEnd ? $head.pos : null;
}

function nextPrompt(prompts: readonly string[], last: string | null) {
  const choices = prompts.filter((prompt) => prompt !== last);
  const pool = choices.length > 0 ? choices : prompts;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

/**
 * The signature nudge: after a pause in writing, a faint question fades in at the
 * cursor. It is a decoration, never part of the document, so it can't be accepted,
 * copied or saved, and any keystroke or cursor move sends it away. At most one per
 * pause: the next waits for more writing.
 */
export const GhostPrompts = Extension.create<GhostPromptsOptions>({
  addCommands() {
    return {
      setGhostPrompts:
        (enabled) =>
        ({ tr, dispatch }) => {
          dispatch?.(
            tr.setMeta(ghostKey, {
              enabled,
              type: "enable",
            } satisfies GhostMeta)
          );
          return true;
        },
    };
  },

  addOptions() {
    return {
      className:
        "pointer-events-none select-none pl-2 text-ghost italic motion-safe:animate-ghost-in",
      delay: 6000,
      enabled: true,
      prompts: [],
    };
  },

  addProseMirrorPlugins() {
    const { prompts, delay, className, enabled } = this.options;

    return [
      new Plugin<GhostState>({
        key: ghostKey,
        props: {
          decorations(state) {
            const shown = ghostKey.getState(state)?.shown;
            if (!shown) {
              return DecorationSet.empty;
            }
            const widget = Decoration.widget(
              shown.pos,
              () => {
                const span = document.createElement("span");
                span.className = className;
                span.textContent = shown.text;
                span.contentEditable = "false";
                // A nudge for the eyes; screen readers keep reading the writer's words
                span.setAttribute("aria-hidden", "true");
                return span;
              },
              { ignoreSelection: true, key: shown.text, side: 1 }
            );
            return DecorationSet.create(state.doc, [widget]);
          },
          handleDOMEvents: {
            // Writing elsewhere, such as the title, isn't a pause on this page
            blur(view) {
              if (ghostKey.getState(view.state)?.shown) {
                view.dispatch(
                  view.state.tr.setMeta(ghostKey, {
                    type: "hide",
                  } satisfies GhostMeta)
                );
              }
              return false;
            },
          },
          handleKeyDown(view) {
            if (ghostKey.getState(view.state)?.shown) {
              view.dispatch(
                view.state.tr.setMeta(ghostKey, {
                  type: "hide",
                } satisfies GhostMeta)
              );
            }
            // Let the key do what it was going to do
            return false;
          },
        },
        state: {
          apply(tr, value) {
            const meta = tr.getMeta(ghostKey) as GhostMeta | undefined;
            if (meta?.type === "enable") {
              return { ...value, enabled: meta.enabled, shown: null };
            }
            if (meta?.type === "show") {
              return { ...value, last: meta.text, shown: meta };
            }
            if (meta?.type === "hide" || tr.docChanged || tr.selectionSet) {
              return value.shown ? { ...value, shown: null } : value;
            }
            return value;
          },
          init: () => ({ enabled, last: null, shown: null }),
        },
        view() {
          let timer: ReturnType<typeof setTimeout> | undefined;
          return {
            destroy() {
              clearTimeout(timer);
            },
            update(view, previous) {
              // Only writing starts the wait; moving the cursor or a shown question doesn't
              if (view.state.doc.eq(previous.doc)) {
                return;
              }
              clearTimeout(timer);
              timer = setTimeout(() => {
                const state = ghostKey.getState(view.state);
                const pos = promptPosition(view.state);
                if (!(state?.enabled && view.hasFocus()) || pos === null) {
                  return;
                }
                const text = nextPrompt(prompts, state.last);
                if (text) {
                  view.dispatch(
                    view.state.tr.setMeta(ghostKey, {
                      pos,
                      text,
                      type: "show",
                    } satisfies GhostMeta)
                  );
                }
              }, delay);
            },
          };
        },
      }),
    ];
  },
  name: "ghostPrompts",
});
