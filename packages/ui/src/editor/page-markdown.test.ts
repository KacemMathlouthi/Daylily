// @vitest-environment happy-dom
import { Editor } from "@tiptap/core";
import { afterEach, describe, expect, it } from "vitest";
import { pageExtensions } from "./extensions";
import type { PageImageOptions } from "./page-image";

let editor: Editor | undefined;

afterEach(() => {
  editor?.destroy();
  editor = undefined;
});

/** The page as Daylily would save it, after opening it in the editor. */
function open(markdown: string, images?: PageImageOptions) {
  editor = new Editor({
    content: markdown,
    contentType: "markdown",
    extensions: pageExtensions(images ? { images } : {}),
  });
  return editor;
}

function reopened(markdown: string) {
  return open(markdown).getMarkdown();
}

/** Pastes as the system would, with files and whatever text came with them. */
function paste(target: Editor, files: File[], text = "") {
  const event = {
    clipboardData: {
      files,
      getData: (type: string) => (type === "text/plain" ? text : ""),
      types: ["Files"],
    },
    preventDefault: () => undefined,
  } as unknown as ClipboardEvent;
  return target.view.someProp("handlePaste", (handle) =>
    handle(target.view, event, target.state.selection.content())
  );
}

const photo = (name: string) => new File(["x"], name, { type: "image/jpeg" });

/** Copies each file in as the next `image-NN.jpg`, as the journal would. */
function journal() {
  let count = 0;
  const added: string[] = [];
  const images: PageImageOptions = {
    add: (file) => {
      count += 1;
      added.push(file.name);
      return Promise.resolve(`image-0${count}.jpg`);
    },
    resolve: () => null,
  };
  return { added, images };
}

const settled = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("a page's images", () => {
  it("keeps an image on its own line", () => {
    const page = "The long way home.\n\n![](image-01.jpg)\n\nThen tea.";
    expect(reopened(page)).toBe(page);
  });

  it("keeps an image written inside a line of text, and the words around it", () => {
    expect(reopened("Before ![](image-01.jpg) after")).toBe(
      "Before ![](image-01.jpg) after"
    );
  });

  it("keeps a description with brackets", () => {
    expect(reopened("![a \\[draft\\] sketch](image-01.jpg)")).toBe(
      "![a \\[draft\\] sketch](image-01.jpg)"
    );
  });

  it("keeps an image in a list", () => {
    const page = "- the fence\n- ![](image-01.jpg)";
    expect(reopened(page)).toBe(page);
  });

  it("keeps an image's description and title", () => {
    expect(reopened('![The fence at dusk](image-02.png "Dusk")')).toBe(
      '![The fence at dusk](image-02.png "Dusk")'
    );
  });

  it("keeps a title with quotes and backslashes", () => {
    const page = '![](image-01.jpg "a \\"quoted\\" C:\\\\ path")';
    expect(reopened(page)).toBe(page);
  });

  it("keeps an image from the web as written", () => {
    expect(reopened("![](https://example.com/a.jpg)")).toBe(
      "![](https://example.com/a.jpg)"
    );
  });

  it("keeps an address with spaces", () => {
    expect(reopened("![](<my photo.jpg>)")).toBe("![](<my photo.jpg>)");
  });
});

describe("pasting images", () => {
  it("puts a pasted image on its own line after the one being written", async () => {
    const { images } = journal();
    const page = open("The long way home.", images);
    page.commands.focus("end");
    expect(paste(page, [photo("fence.jpg")])).toBe(true);
    await settled();
    // The empty line under it is where writing goes on
    expect(page.getMarkdown().trimEnd()).toBe(
      "The long way home.\n\n![](image-01.jpg)"
    );
    page.commands.insertContent("Then tea.");
    expect(page.getMarkdown()).toBe(
      "The long way home.\n\n![](image-01.jpg)\n\nThen tea."
    );
  });

  it("fills an empty line rather than adding another", async () => {
    const { images } = journal();
    const page = open("Before.\n\nAfter.", images);
    page.commands.setContent("<p>Before.</p><p></p><p>After.</p>");
    page.commands.setTextSelection(10);
    paste(page, [photo("fence.jpg")]);
    await settled();
    expect(page.getMarkdown()).toBe("Before.\n\n![](image-01.jpg)\n\nAfter.");
  });

  it("adds several in the order they came", async () => {
    const { images, added } = journal();
    const page = open("Today.", images);
    page.commands.focus("end");
    paste(page, [photo("first.jpg"), photo("second.jpg")]);
    await settled();
    await settled();
    expect(added).toEqual(["first.jpg", "second.jpg"]);
    expect(page.getMarkdown().trimEnd()).toBe(
      "Today.\n\n![](image-01.jpg)\n\n![](image-02.jpg)"
    );
  });

  it("leaves the words to paste when a picture of them comes along, as Office apps send", () => {
    const { images, added } = journal();
    const page = open("Today.", images);
    expect(paste(page, [photo("image.png")], "Some copied words")).toBeFalsy();
    expect(added).toEqual([]);
  });

  it("leaves a page that's only read alone", () => {
    const page = open("Today.");
    expect(paste(page, [photo("fence.jpg")])).toBeFalsy();
  });

  it("adds nothing when the journal refuses the file", async () => {
    const page = open("Today.", {
      add: () => Promise.resolve(null),
      resolve: () => null,
    });
    page.commands.focus("end");
    paste(page, [photo("photo.heic")]);
    await settled();
    expect(page.getMarkdown()).toBe("Today.");
  });
});
