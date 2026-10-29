// @vitest-environment happy-dom
import { Editor } from "@tiptap/core";
import { afterEach, describe, expect, it } from "vitest";
import { pageExtensions } from "./extensions";
import { movingBlockKey } from "./moving-block";

let editor: Editor | undefined;

afterEach(() => {
  editor?.destroy();
  editor = undefined;
});

function open(markdown: string) {
  editor = new Editor({
    content: markdown,
    contentType: "markdown",
    element: document.createElement("div"),
    extensions: pageExtensions(),
  });
  return editor;
}

const faint = (page: Editor) =>
  Array.from(page.view.dom.querySelectorAll(".block-moving"), (block) =>
    block.textContent?.trim()
  );

describe("the block being moved", () => {
  it("goes faint where it was until it lands", () => {
    const page = open("One.\n\nTwo.");
    const two = page.state.doc.child(0).nodeSize;
    page.view.dispatch(page.state.tr.setMeta(movingBlockKey, two));
    expect(faint(page)).toEqual(["Two."]);

    page.view.dispatch(page.state.tr.setMeta(movingBlockKey, null));
    expect(faint(page)).toEqual([]);
  });

  it("stays marked while the page changes above it", () => {
    const page = open("One.\n\nTwo.");
    const two = page.state.doc.child(0).nodeSize;
    page.view.dispatch(page.state.tr.setMeta(movingBlockKey, two));
    page.view.dispatch(page.state.tr.insertText("Still ", 1));
    expect(faint(page)).toEqual(["Two."]);
  });

  it("leaves the markdown as written", () => {
    const page = open("- One\n\nTwo.");
    page.view.dispatch(page.state.tr.setMeta(movingBlockKey, 0));
    expect(page.getMarkdown()).toBe("- One\n\nTwo.");
  });
});
