import { PageContent } from "@daylily/ui/components/page-content";
import { usePageEditor } from "@daylily/ui/editor/use-page-editor";
import type { PastDay } from "../../lib/days";
import { DayCover } from "./day-cover";
import { DayDate } from "./day-date";

/**
 * A sealed day as written (Paper: "04a"): the same page as the writing screen, in
 * a quieter ink, readable and selectable but never changed.
 */
export function SealedPage({
  day,
  page,
}: {
  day: string;
  page: Extract<PastDay, { kind: "written" }>;
}) {
  const editor = usePageEditor({ content: page.markdown, editable: false });

  return (
    <>
      <DayCover label={page.cover?.label ?? ""} url={page.cover?.url ?? null} />
      <div className="flex flex-col gap-3.5 pt-7.5">
        <DayDate day={day} />
        {page.title ? (
          <h1 className="font-display text-display-sm text-ink leading-12 tracking-title">
            {page.title}
          </h1>
        ) : null}
        <PageContent className="pt-1 text-ink-soft" editor={editor} />
      </div>
    </>
  );
}
