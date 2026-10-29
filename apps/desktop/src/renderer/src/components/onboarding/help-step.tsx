import { Switch } from "@daylily/ui/primitives/switch";
import { Bell, MessageCircleQuestion } from "lucide-react";
import { useCallback } from "react";
import earth from "../../assets/earth.jpg";
import { ReminderTimeSelect } from "../reminder-time";
import type { OnboardingStep, StepProps } from "./step";
import { StepRow } from "./step-row";

/** Paper 10f: the quiet questions and the evening reminder, both on to begin with. */
function ALittleHelp({ choices, change }: StepProps) {
  const { ghostPrompts, reminder } = choices;
  const setGhostPrompts = useCallback(
    (on: boolean) => change({ ghostPrompts: on }),
    [change]
  );
  const setReminder = useCallback(
    (enabled: boolean) => change({ reminder: { ...reminder, enabled } }),
    [change, reminder]
  );
  const setTime = useCallback(
    (time: string) => change({ reminder: { ...reminder, time } }),
    [change, reminder]
  );

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <h1 className="font-display text-display-md text-ink leading-13 tracking-heading-sm">
          Would you like a little help?
        </h1>
        <p className="text-body-sm text-ink-muted leading-6">
          Two small things that help the habit. Neither ever writes for you, and
          both can change any time in Settings.
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        <StepRow
          control={
            <Switch
              aria-label="Ghost prompts"
              checked={ghostPrompts}
              onCheckedChange={setGhostPrompts}
            />
          }
          icon={
            <MessageCircleQuestion className="size-4.5" strokeWidth={1.9} />
          }
          title="Ghost prompts"
        >
          When you pause, a faint question:{" "}
          <span className="font-writing text-ui-lg italic">
            …and how did that feel?
          </span>
        </StepRow>
        <StepRow
          control={
            <>
              <ReminderTimeSelect
                className="bg-paper-page"
                disabled={!reminder.enabled}
                onChange={setTime}
                value={reminder.time}
              />
              <Switch
                aria-label="Ask me “How was your day?”"
                checked={reminder.enabled}
                onCheckedChange={setReminder}
              />
            </>
          }
          icon={<Bell className="size-4.5" strokeWidth={1.9} />}
          title="Ask me “How was your day?”"
        >
          Once a day, skipped if you’ve already written.
        </StepRow>
      </div>
    </>
  );
}

export const helpStep: OnboardingStep = {
  art: {
    alt: "The earth from space at the end of a day, its edge lit warm",
    position: "50% 50%",
    src: earth,
  },
  caption: {
    line: "Most people write in the evening, when the day is done.",
    note: "A gentle nudge can help. Never a guilt trip.",
  },
  Form: ALittleHelp,
  id: "help",
  next: "Open today’s page",
  // After the folder step's save, so these go to the journal chosen
  save: ({ ghostPrompts, reminder }) =>
    window.daylily.journal
      .setConfig({ ghostPrompts, reminder })
      .then(() => undefined),
};
