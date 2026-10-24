import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { LINKS } from "../../lib/links";
import { SettingsRow, SettingsRows } from "./parts";
import { UpdatesGroup } from "./updates-group";

const ROWS = [
  { href: LINKS.manifesto, title: "Read the manifesto" },
  { href: LINKS.source, title: "Source code on GitHub" },
  {
    description: "AGPL-3.0. The app is free; your words are yours.",
    href: LINKS.licence,
    title: "Licence",
  },
];

/** Paper's "09e": what Daylily is, which version, and where it lives. */
export function AboutSection() {
  const { data: info } = useQuery({
    queryFn: () => window.daylily.app.info(),
    queryKey: ["app", "info"],
  });

  return (
    <>
      <header className="flex items-center gap-4.5">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-daylily-wash-line bg-daylily-wash">
          <DaylilyMark className="text-daylily" size={36} />
        </span>
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-ink text-title leading-10 tracking-title">
            Daylily
          </h1>
          <p className="text-ink-subtle text-ui">
            Version {info?.version} · free and open source
          </p>
        </div>
      </header>

      <p className="font-display text-ink-soft text-title-2xs italic leading-7.5">
        One page a day. Written by you, kept by you, grown into a garden.
      </p>

      {info ? <UpdatesGroup version={info.version} /> : null}

      <SettingsRows>
        {ROWS.map((row) => (
          <a
            className="transition-colors hover:bg-paper-tint"
            href={row.href}
            key={row.title}
            rel="noreferrer"
            target="_blank"
          >
            <SettingsRow description={row.description} title={row.title}>
              <ArrowUpRight
                className="size-3.25 shrink-0 text-ink-subtle"
                strokeWidth={2}
              />
            </SettingsRow>
          </a>
        ))}
      </SettingsRows>
    </>
  );
}
