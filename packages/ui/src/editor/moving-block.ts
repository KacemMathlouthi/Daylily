import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

/** Where the block being moved by its handle starts, or null while none is. */
export const movingBlockKey = new PluginKey<number | null>("movingBlock");

/**
 * Marks the block being moved by its handle, so it goes faint where it was until
 * it lands (Paper 18b). A decoration, since ProseMirror redraws a block whose
 * classes are changed from outside.
 */
export const MovingBlock = Extension.create({
  addProseMirrorPlugins() {
    return [
      new Plugin<number | null>({
        key: movingBlockKey,
        props: {
          decorations(state) {
            const pos = movingBlockKey.getState(state) ?? null;
            const node = pos === null ? null : state.doc.nodeAt(pos);
            if (pos === null || !node) {
              return null;
            }
            return DecorationSet.create(state.doc, [
              Decoration.node(pos, pos + node.nodeSize, {
                class: "block-moving",
              }),
            ]);
          },
        },
        state: {
          apply(tr, pos) {
            const meta = tr.getMeta(movingBlockKey) as
              | number
              | null
              | undefined;
            if (meta !== undefined) {
              return meta;
            }
            return pos === null ? null : tr.mapping.map(pos);
          },
          init: () => null,
        },
      }),
    ];
  },
  name: "movingBlock",
});
