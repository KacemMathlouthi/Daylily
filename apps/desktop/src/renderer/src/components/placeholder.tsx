import type { ReactNode } from "react";

/** Stands in for a screen until it is built; the design lives in Paper. */
export function Placeholder({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="flex grow flex-col items-center justify-center gap-3 px-10 pb-12 text-center">
      <h1 className="font-display text-5xl text-ink tracking-heading-sm">
        {title}
      </h1>
      <div className="max-w-110 text-body-sm text-ink-muted leading-6">
        {children ?? "This screen is designed in Paper and comes next."}
      </div>
    </section>
  );
}
