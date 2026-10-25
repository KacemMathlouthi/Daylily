import { Switch } from "@daylily/ui/primitives/switch";
import { Bell, MessageCircleQuestion } from "lucide-react";
import { type ReactNode, useCallback } from "react";
import dusk from "../../assets/dusk.jpg";
import { ReminderTimeSelect } from "../reminder-time";
import type { OnboardingStep, StepProps } from "./step";

/** A help that can be turned on or off (Paper 10f). */
function HelpRow({
  icon,
  title,
  children,
  control,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-paper-sunk px-4 py-3.5">
      <div className="flex items-center gap-3 text-ink-muted">
        {icon}
        <div className="flex flex-col gap-px">
          <span className="font-medium text-ink text-sm leading-4.5">
            {title}
          </span>
          <span className="text-caption text-ink-subtle leading-4">
            {children}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">{control}</div>
    </div>
  );
}

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
        <HelpRow
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
        </HelpRow>
        <HelpRow
          control={
            <>
              <ReminderTimeSelect
                className="bg-paper-page"
                disabled={!reminder.enabled}
                onChange={setTime}
                value={reminder.time}
              />
              <Switch
                aria-label="Ask me how my day was"
                checked={reminder.enabled}
                onCheckedChange={setReminder}
              />
            </>
          }
          icon={<Bell className="size-4.5" strokeWidth={1.9} />}
          title="Ask me “How was your day?”"
        >
          Once a day, skipped if you’ve already written.
        </HelpRow>
      </div>
    </>
  );
}

export const helpStep: OnboardingStep = {
  art: {
    alt: "Daylilies in a meadow at dusk, hills fading into a pink sky",
    position: "18% 50%",
    src: dusk,
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
