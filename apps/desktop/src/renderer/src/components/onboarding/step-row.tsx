import type { ReactNode } from "react";

/** A row of a step's own: a help to turn on or off (Paper 10f), or a place in the app (10i). */
export function StepRow({
  icon,
  title,
  children,
  control,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  control?: ReactNode;
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
      {control ? (
        <div className="flex shrink-0 items-center gap-2.5">{control}</div>
      ) : null}
    </div>
  );
}
