"use client";

import { Switch } from "@daylily/ui/primitives/switch";
import { useId } from "react";

const FEATURES = [
  { hint: "Questions when you pause", name: "Ghost prompts", on: true },
  {
    hint: "“What made me happiest this spring?”",
    name: "Ask your journal",
    on: true,
  },
  { hint: "Weekly and yearly look-backs", name: "Retrospectives", on: false },
  { hint: "Only when you ask", name: "Cover images", on: false },
] as const;

function FeatureRow({
  name,
  hint,
  on,
}: {
  name: string;
  hint: string;
  on: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between border-line border-t px-4 py-2.75">
      <label className="flex cursor-pointer flex-col gap-px" htmlFor={id}>
        <span className="font-medium text-ink text-ui">{name}</span>
        <span className="text-ink-subtle text-meta">{hint}</span>
      </label>
      <Switch defaultChecked={on} id={id} />
    </div>
  );
}

/** A working slice of the AI settings: every feature is its own switch. */
export function AiToggles() {
  return (
    <div className="flex flex-col overflow-clip rounded-xl border border-ink/6 bg-paper-page shadow-card">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-semibold text-ink-subtle text-xs">Model</span>
        <span className="flex items-center gap-1.5 rounded-row bg-paper-tint px-2.25 py-1 font-medium text-ink text-xs">
          <span className="size-1.5 rounded-full bg-moss" />
          Ollama · qwen3.8:27b · local
        </span>
      </div>
      {FEATURES.map((feature) => (
        <FeatureRow key={feature.name} {...feature} />
      ))}
    </div>
  );
}
