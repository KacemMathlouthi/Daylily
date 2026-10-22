import { cn } from "@daylily/ui/lib/cn";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@daylily/ui/primitives/toggle-group";
import { useCallback } from "react";

/** Paper's outlined 30px controls in screen headers (Today, arrows, Save as image). */
export const OUTLINED =
  "h-7.5 rounded-md border-line text-ink-muted hover:bg-paper-tint hover:text-ink";

/** Paper's segmented switch: a sunken track with a raised chip for the current option. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string; disabled?: boolean }[];
  onChange?: (value: T) => void;
}) {
  const change = useCallback(
    (next: string[]) => {
      // A toggle group can be emptied by pressing the current option; keep one chosen
      const [chosen] = next;
      if (chosen && onChange) {
        onChange(chosen as T);
      }
    },
    [onChange]
  );

  return (
    <ToggleGroup
      aria-label={label}
      className="rounded-tile bg-paper-tint p-0.75"
      onValueChange={change}
      spacing={0}
      value={[value]}
    >
      {options.map((option) => (
        <ToggleGroupItem
          className={cn(
            "h-auto rounded-row! border-0 px-3 py-1.25 font-medium text-caption text-ink-subtle",
            !option.disabled &&
              "hover:bg-transparent hover:text-ink data-pressed:bg-paper-page data-pressed:text-ink data-pressed:shadow-hairline dark:data-pressed:bg-paper-press"
          )}
          disabled={option.disabled}
          key={option.value}
          value={option.value}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
