import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { Switch } from "@daylily/ui/primitives/switch";
import { useCallback } from "react";
import { useJournalConfig } from "../../lib/preferences";
import { ReminderTimeSelect, reminderTimeLabel } from "../reminder-time";
import {
  SettingsGroup,
  SettingsHeading,
  SettingsRow,
  SettingsRows,
} from "./parts";

/** Paper's "09c": one evening reminder and what it will look like. */
export function RemindersSection() {
  const [config, change] = useJournalConfig();
  const { enabled, time } = config.reminder;
  const label = reminderTimeLabel(time);
  const setEnabled = useCallback(
    (next: boolean) => change({ reminder: { enabled: next } }),
    [change]
  );
  const chooseTime = useCallback(
    (next: string) => change({ reminder: { time: next } }),
    [change]
  );

  return (
    <>
      <SettingsHeading title="Reminders">
        One gentle nudge in the evening. Skipped if today already has words, and
        it never mentions the days you rested.
      </SettingsHeading>

      <SettingsGroup label="Evening reminder">
        <SettingsRows>
          <SettingsRow
            description="A notification from Daylily, once a day."
            title="Remind me to write"
          >
            <Switch
              aria-label="Remind me to write"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </SettingsRow>
          <SettingsRow
            description="Your local time, wherever you are."
            title="Time"
          >
            <ReminderTimeSelect
              disabled={!enabled}
              onChange={chooseTime}
              value={time}
            />
          </SettingsRow>
        </SettingsRows>
      </SettingsGroup>

      {enabled ? (
        <SettingsGroup label="What you’ll see">
          <div className="flex w-90 items-start gap-3 rounded-xl border border-line bg-paper-raised px-3.5 py-3 shadow-card-lift">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-ink">
              <DaylilyMark className="text-daylily" size={18} />
            </span>
            <div className="flex grow flex-col gap-0.5">
              <div className="flex justify-between">
                <span className="font-semibold text-caption text-ink">
                  Daylily
                </span>
                <span className="text-ink-faint text-meta">{label}</span>
              </div>
              <span className="text-caption text-ink-soft">
                How was your day?
              </span>
            </div>
          </div>
        </SettingsGroup>
      ) : null}
    </>
  );
}
