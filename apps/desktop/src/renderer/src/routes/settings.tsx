import { cn } from "@daylily/ui/lib/cn";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { AboutSection } from "../components/settings/about-section";
import { AppearanceSection } from "../components/settings/appearance-section";
import { JournalSection } from "../components/settings/journal-section";
import { RemindersSection } from "../components/settings/reminders-section";
import { WritingSection } from "../components/settings/writing-section";

const SECTIONS = [
  { component: JournalSection, id: "journal", label: "Journal" },
  { component: WritingSection, id: "writing", label: "Writing & sealing" },
  { component: RemindersSection, id: "reminders", label: "Reminders" },
  { component: AppearanceSection, id: "appearance", label: "Appearance" },
  { component: AboutSection, id: "about", label: "About" },
] as const satisfies readonly {
  component: ComponentType;
  id: string;
  label: string;
}[];

type SectionId = (typeof SECTIONS)[number]["id"];

function isSection(value: unknown): value is SectionId {
  return SECTIONS.some((section) => section.id === value);
}

export const Route = createFileRoute("/settings")({
  component: SettingsScreen,
  // The open section lives in the URL, so other screens can link straight to it
  validateSearch: (
    search: Record<string, unknown>
  ): { section: SectionId } => ({
    section: isSection(search.section) ? search.section : "journal",
  }),
});

/** Paper's "09a" to "09e": a list of sections beside the one that's open. */
function SettingsScreen() {
  const { section } = Route.useSearch();
  const Section =
    SECTIONS.find((item) => item.id === section)?.component ?? JournalSection;

  return (
    <div className="flex grow">
      <nav
        aria-label="Settings"
        className="flex w-55 shrink-0 flex-col gap-0.5 border-line/70 border-r px-3 pt-12 pb-5"
      >
        <h1 className="px-2 pb-3.5 font-display text-ink text-lede leading-6.5">
          Settings
        </h1>
        {SECTIONS.map((item) => (
          <Link
            className={cn(
              "rounded-row px-2.5 py-2 text-ui transition-colors",
              item.id === section
                ? "bg-paper-sunk font-semibold text-ink"
                : "font-medium text-ink-soft hover:bg-paper-sunk/60 hover:text-ink"
            )}
            key={item.id}
            search={{ section: item.id }}
            to="/settings"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="grow px-8 pt-14.5 pb-12">
        <div className="mx-auto flex w-full max-w-170 flex-col gap-6.5">
          <Section />
        </div>
      </div>
    </div>
  );
}
