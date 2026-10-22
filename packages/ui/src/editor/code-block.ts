import { mergeAttributes } from "@tiptap/core";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

/** The common languages (JavaScript, Python, Bash, …), bundled so highlighting works offline. */
const lowlight = createLowlight(common);

/**
 * Fenced code with syntax colours. The block carries its language as
 * `data-language`, so the page can label it; in the file it stays a plain
 * ```python fence.
 */
export const CodeBlock = CodeBlockLowlight.extend({
  renderHTML({ node, HTMLAttributes }) {
    const language: string | null = node.attrs.language;
    return [
      "pre",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-language": language ?? "",
      }),
      ["code", { class: language ? `language-${language}` : null }, 0],
    ];
  },
}).configure({ defaultLanguage: null, lowlight });
