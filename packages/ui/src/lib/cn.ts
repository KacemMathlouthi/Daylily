import { createCn } from "cn/config";

/**
 * Class merging that knows our theme. Without these scales, `cn` reads names like
 * `text-ui` or `shadow-card` as colours, and a later colour class silently drops
 * the size or shadow. Keep the lists in step with the @theme blocks in
 * tokens.css and globals.css.
 */
export const cn = createCn({
  extend: {
    theme: {
      animate: ["bloom", "bud-close", "caret", "petal-open", "rise-in"],
      ease: ["soft"],
      leading: [
        "display",
        "display-tight",
        "heading",
        "heading-loose",
        "wordmark",
      ],
      radius: ["card-lg", "panel", "row", "tile"],
      shadow: [
        "card",
        "card-lift",
        "hairline",
        "header",
        "panel",
        "panel-glass",
        "press-ink",
        "press-ink-down",
        "press-ink-hover",
        "press-paper",
        "press-paper-down",
        "press-paper-hover",
        "sheet",
        "tile",
        "toast",
        "window",
      ],
      text: [
        "body",
        "body-sm",
        "caption",
        "display",
        "display-lg",
        "display-sm",
        "display-xl",
        "display-xs",
        "fluid-closing",
        "fluid-hero",
        "fluid-page",
        "fluid-statement",
        "fluid-wordmark",
        "lead",
        "lede",
        "meta",
        "tag",
        "tag-xs",
        "title",
        "title-2xs",
        "title-md",
        "title-sm",
        "title-xs",
        "ui",
        "ui-lg",
        "wordmark",
      ],
      tracking: [
        "caps",
        "display",
        "display-tight",
        "eyebrow",
        "heading",
        "heading-sm",
        "label",
        "snug",
        "title",
        "wordmark",
      ],
    },
  },
});
