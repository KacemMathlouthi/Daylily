// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type PageChange, usePageEditor } from "./use-page-editor";

// React's act() checks this flag before it runs effects outside a test renderer
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let opened: ReturnType<typeof usePageEditor> | undefined;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  opened = undefined;
});

function Page({
  content,
  editable,
  onChange,
}: {
  content: string;
  editable: boolean;
  onChange: (change: PageChange) => void;
}) {
  opened = usePageEditor({ content, editable, onChange });
  return null;
}

function open(content: string, editable = true) {
  const onChange = vi.fn();
  const element = document.createElement("div");
  document.body.append(element);
  root = createRoot(element);
  act(() =>
    root?.render(
      <Page content={content} editable={editable} onChange={onChange} />
    )
  );
  return onChange;
}

describe("usePageEditor", () => {
  it("says nothing changed when a page is only opened", () => {
    expect(open("- [ ] Piranesi\n- [ ] Stoner\n")).not.toHaveBeenCalled();
    expect(open("Read only.", false)).not.toHaveBeenCalled();
  });

  it("reports a change made to the page", () => {
    const onChange = open("Words.");
    act(() => opened?.commands.insertContent(" More."));
    expect(onChange).toHaveBeenCalledOnce();
  });
});
