import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@daylily/ui/primitives/select";
import { Switch } from "@daylily/ui/primitives/switch";
import { useCallback } from "react";
import { dateFormat } from "../../lib/format";
import { useJournalConfig } from "../../lib/preferences";
import {
  SettingsGroup,
  SettingsHeading,
  SettingsRow,
  SettingsRows,
} from "./parts";

const TIME = dateFormat({
  hour: "numeric",
  minute: "2-digit",
});

/** Every half hour of the day, as `HH:MM` with its "9:00 pm" label. */
const TIMES = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = (index % 2) * 30;
  return {
    label: TIME.format(new Date(2000, 0, 1, hour, minute)).toLowerCase(),
    value: `${String(hour).padStart(2, "0")}:${minute === 0 ? "00" : "30"}`,
  };
});
const LABELS = new Map(TIMES.map((time) => [time.value, time.label]));

/** Paper's "09c": one evening reminder and what it will look like. */
export function RemindersSection() {
  const [config, change] = useJournalConfig();
  const { enabled, time } = config.reminder;
  const label = LABELS.get(time) ?? time;
  const setEnabled = useCallback(
    (next: boolean) => change({ reminder: { enabled: next } }),
    [change]
  );
  const chooseTime = useCallback(
    (next: string | null) => {
      if (next) {
        change({ reminder: { time: next } });
      }
    },
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
            <Select
              disabled={!enabled}
              items={TIMES}
              onValueChange={chooseTime}
              value={time}
            >
              <SelectTrigger
                aria-label="Reminder time"
                className="h-7.5 gap-2 rounded-md border-line pr-2.5 pl-3 font-medium text-caption text-ink"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {TIMES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
