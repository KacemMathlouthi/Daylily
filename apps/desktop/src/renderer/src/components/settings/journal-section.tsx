import { Button } from "@daylily/ui/primitives/button";
import { Folder } from "lucide-react";
import { MOCK_DAYS } from "../../mock/journal";
import { OUTLINED } from "../controls";
import {
  SettingsGroup,
  SettingsHeading,
  SettingsRow,
  SettingsRows,
} from "./parts";

const ON_DISK = [
  { path: "2026/10/22/2026-10-22.md", what: "Each day" },
  { path: "cover.jpg, image-01.jpg", what: "Its cover and images" },
  { path: ".daylily/config.json", what: "Journal preferences" },
];

/** Paper's "09a": where the journal lives and what's in it. */
export function JournalSection() {
  return (
    <>
      <SettingsHeading title="Journal">
        Your days live in a folder you own, one plain markdown file each. Open
        them in any editor, sync the folder however you like.
      </SettingsHeading>

      <SettingsGroup
        label="Folder"
        note="Changing the folder never moves or deletes your days. Daylily just starts reading from the new place."
      >
        <div className="flex items-center gap-3.5 rounded-xl border border-line p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-paper-sunk">
            <Folder className="size-4.5 text-moss" strokeWidth={1.9} />
          </span>
          <div className="flex min-w-0 grow flex-col gap-0.5">
            <span className="font-mono text-ink text-ui leading-4.5">
              ~/Journal
            </span>
            <span className="text-ink-subtle text-xs">
              {MOCK_DAYS.size} days · 41 MB · plain markdown
            </span>
          </div>
          {/* The folder picker arrives with the storage layer */}
          <div className="flex shrink-0 gap-2">
            <Button
              className={`${OUTLINED} px-3 font-medium text-caption text-ink`}
              variant="ghost"
            >
              Show in folder
            </Button>
            <Button
              className={`${OUTLINED} px-3 font-medium text-caption text-ink`}
              variant="ghost"
            >
              Change…
            </Button>
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup label="On disk">
        <SettingsRows>
          {ON_DISK.map((item) => (
            <SettingsRow key={item.what} title={item.what}>
              <span className="font-mono text-ink-muted text-xs">
                {item.path}
              </span>
            </SettingsRow>
          ))}
        </SettingsRows>
      </SettingsGroup>
    </>
  );
}
