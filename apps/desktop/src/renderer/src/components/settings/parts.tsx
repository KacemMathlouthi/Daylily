import type { ReactNode } from "react";

/** A section's title and the sentence that explains it. */
export function SettingsHeading({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-1.5">
      <h1 className="font-display text-ink text-title leading-10 tracking-title">
        {title}
      </h1>
      <p className="text-ink-muted text-sm leading-5.5">{children}</p>
    </header>
  );
}

/** A labelled group: small caps above, an optional quiet note below. */
export function SettingsGroup({
  label,
  note,
  children,
}: {
  label: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="font-semibold text-ink-faint text-tag uppercase leading-3.5 tracking-caps">
        {label}
      </h2>
      {children}
      {note ? (
        <p className="text-ink-subtle text-xs leading-4.5">{note}</p>
      ) : null}
    </section>
  );
}

/** Rows sharing one rounded card, with hairlines between them. */
export function SettingsRows({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col divide-y divide-line/70 overflow-hidden rounded-xl border border-line">
      {children}
    </div>
  );
}

/** One setting: its name and a line about it, the control on the right. */
export function SettingsRow({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-4 py-3.25">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium text-ink text-ui-lg leading-4.5">
          {title}
        </span>
        {description ? (
          <span className="text-ink-subtle text-xs">{description}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
