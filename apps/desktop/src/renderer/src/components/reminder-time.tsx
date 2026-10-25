import { cn } from "@daylily/ui/lib/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@daylily/ui/primitives/select";
import { useCallback } from "react";
import { dateFormat } from "../lib/format";

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

/** `21:00` as "9:00 pm", the way the reminder's time is shown. */
export function reminderTimeLabel(time: string) {
  return LABELS.get(time) ?? time;
}

/** The evening reminder's time, every half hour, in Settings and onboarding alike. */
export function ReminderTimeSelect({
  className,
  disabled = false,
  onChange,
  value,
}: {
  className?: string;
  disabled?: boolean;
  onChange: (time: string) => void;
  value: string;
}) {
  const choose = useCallback(
    (next: string | null) => {
      if (next) {
        onChange(next);
      }
    },
    [onChange]
  );
  return (
    <Select
      disabled={disabled}
      items={TIMES}
      onValueChange={choose}
      value={value}
    >
      <SelectTrigger
        aria-label="Reminder time"
        className={cn(
          "h-7.5 gap-2 rounded-md border-line pr-2.5 pl-3 font-medium text-caption text-ink",
          className
        )}
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
  );
}
