import { FileText, Lightbulb } from "lucide-react";
import train from "../../../../../resources/covers/train.jpg";
import type { OnboardingStep } from "./step";
import { StepRow } from "./step-row";

/**
 * Paper 10i: the notebook, before the folder. The page asks once, in the
 * evening; thoughts and notes keep the rest of the day, and neither seals.
 */
function TheRestOfTheDay() {
  return (
    <>
      <div className="flex flex-col gap-2.5">
        <h1 className="font-display text-display-md text-ink leading-13 tracking-heading-sm">
          And the rest of the day.
        </h1>
        <p className="text-body-sm text-ink-muted leading-6">
          Today’s page is for the evening. Through the day, the Notebook in the
          sidebar keeps what comes. Neither seals, and neither grows a flower:
          that’s the page’s.
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        <StepRow
          icon={<Lightbulb className="size-4.5" strokeWidth={1.9} />}
          title="Thoughts"
        >
          As the day goes: something someone said, an idea on the way. Each
          keeps its time.
        </StepRow>
        <StepRow
          icon={<FileText className="size-4.5" strokeWidth={1.9} />}
          title="Notes"
        >
          Pages you keep and come back to: books to read, a recipe you keep
          changing.
        </StepRow>
      </div>
    </>
  );
}

export const notebookStep: OnboardingStep = {
  art: {
    alt: "A train window over a river through autumn hills, daylilies on the sill",
    position: "38% 50%",
    src: train,
  },
  caption: {
    line: "An idea on the way somewhere is worth keeping too.",
    note: "The page waits for the evening. Thoughts don’t.",
  },
  Form: TheRestOfTheDay,
  id: "notebook",
  next: "Continue",
};
