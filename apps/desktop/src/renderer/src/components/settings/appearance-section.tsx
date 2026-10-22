import { Radio } from "@base-ui/react/radio";
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

/** A tiny app window in a theme's own tokens: sidebar, a title, two lines, three flowers. */
function Window({
  theme,
  half = false,
}: {
  theme: "light" | "dark";
  half?: boolean;
}) {
  return (
    <div className={cn(theme, "flex grow bg-paper-page")}>
      {half && theme === "dark" ? null : (
        <div
          className={cn(
            "flex shrink-0 flex-col gap-1.5 border-line border-r bg-paper-sunk px-2 py-2.5",
            half ? "w-6.5" : "w-13"
          )}
        >
          {half
            ? null
            : [28, 22, 26].map((width) => (
                <span
                  className="h-1.25 rounded-full bg-line-strong"
                  key={width}
                  style={{ width }}
                />
              ))}
        </div>
      )}
      <div className="flex grow flex-col gap-1.75 px-3 py-3.5">
        <span className="h-2 w-[60%] rounded-full bg-ink" />
        <span className="h-1.25 w-[90%] rounded-full bg-line-strong" />
        <span className="h-1.25 w-[72%] rounded-full bg-line-strong" />
        {half ? null : (
          <span className="flex gap-1 pt-1">
            <span className="size-1.75 rounded-full bg-daylily" />
            <span className="size-1.75 rounded-full bg-petal" />
            <span className="size-1.75 rounded-full bg-saffron" />
          </span>
        )}
      </div>
    </div>
  );
}

function Preview({ value }: { value: ThemePreference }) {
  return (
    <div className="flex h-24 overflow-hidden rounded-md border border-line">
      {value === "system" ? (
        <>
          <Window half theme="light" />
          <Window half theme="dark" />
        </>
      ) : (
        <Window theme={value} />
      )}
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
