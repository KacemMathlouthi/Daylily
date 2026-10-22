import { Radio } from "@base-ui/react/radio";
import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { cn } from "@daylily/ui/lib/cn";
import { RadioGroup } from "@daylily/ui/primitives/radio-group";
import { useCallback } from "react";
import { type ThemePreference, useTheme } from "../../lib/theme";
import { SettingsGroup, SettingsHeading } from "./parts";

const OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Match the system", value: "system" },
];

/** The mark on a theme's own paper; "match the system" splits the card down the middle. */
function Preview({ value }: { value: ThemePreference }) {
  return (
    <div className="relative flex h-24 items-center justify-center overflow-hidden rounded-md border border-line">
      {value === "system" ? (
        <span className="absolute inset-0 flex">
          <span className="light grow bg-paper-page" />
          <span className="dark grow bg-paper" />
        </span>
      ) : (
        <span
          className={cn(
            value,
            "absolute inset-0",
            value === "dark" ? "bg-paper" : "bg-paper-page"
          )}
        />
      )}
      <DaylilyMark className="relative text-daylily" size={36} />
    </div>
  );
}

/** Paper's "09d": light, dark, or whatever the computer prefers. */
export function AppearanceSection() {
  const { preference, setPreference } = useTheme();
  const choose = useCallback(
    (next: unknown) => setPreference(next as ThemePreference),
    [setPreference]
  );

  return (
    <>
      <SettingsHeading title="Appearance">
        Warm paper by day, near-black by night. The sun and moon in the sidebar
        switch between them too.
      </SettingsHeading>

      <SettingsGroup label="Theme">
        <RadioGroup
          aria-label="Theme"
          className="grid-cols-3 gap-2.5"
          onValueChange={choose}
          value={preference}
        >
          {OPTIONS.map((option) => (
            // The whole card is the radio: Paper's theme choices are pictures, not dots
            <Radio.Root
              className="group/theme flex cursor-pointer flex-col gap-3 rounded-xl border border-line-strong p-3 text-left outline-none transition-colors hover:border-ink-ghost focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:border-daylily data-checked:bg-daylily-wash"
              key={option.value}
              value={option.value}
            >
              <Preview value={option.value} />
              <span className="flex items-center justify-between">
                <span className="font-semibold text-ink text-ui-lg">
                  {option.label}
                </span>
                <span className="flex size-4 items-center justify-center rounded-full border-[1.5px] border-ink-ghost group-data-checked/theme:border-daylily group-data-checked/theme:bg-daylily">
                  <Radio.Indicator className="size-1.5 rounded-full bg-paper-page" />
                </span>
              </span>
            </Radio.Root>
          ))}
        </RadioGroup>
      </SettingsGroup>
    </>
  );
}
