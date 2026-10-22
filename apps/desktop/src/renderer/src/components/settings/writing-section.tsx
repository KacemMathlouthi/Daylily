import { Switch } from "@daylily/ui/primitives/switch";
import { useState } from "react";
import { useNow } from "../../lib/use-now";
import { SealCountdown } from "../seal-countdown";
import {
  SettingsGroup,
  SettingsHeading,
  SettingsRow,
  SettingsRows,
} from "./parts";

/** Paper's "09b": nudges while writing, and how days seal. */
export function WritingSection() {
  const now = useNow();
  // Held here until the journal's config file exists
  const [nudges, setNudges] = useState(true);
  const [galleryCovers, setGalleryCovers] = useState(true);

  return (
    <>
      <SettingsHeading title="Writing & sealing">
        Today is the only page you can write. When the day ends it seals, honest
        and unedited, like ink in a paper journal.
      </SettingsHeading>

      <SettingsGroup label="While you write">
        <SettingsRows>
          <SettingsRow
            description="A quiet question when you pause. Never inserted, gone the moment you type."
            title="Ghost prompts"
          >
            <Switch
              aria-label="Ghost prompts"
              checked={nudges}
              onCheckedChange={setNudges}
            />
          </SettingsRow>
        </SettingsRows>
      </SettingsGroup>

      <SettingsGroup
        label="Sealing"
        note="Sealed days are never rewritten. If a day is changed outside Daylily, it shows a quiet “edited outside” mark. Nothing is blocked."
      >
        <SettingsRows>
          <SettingsRow
            description="Writing at 1am still belongs to the day you’re living."
            title="A day ends at 4am"
          >
            <span className="shrink-0 text-ui">
              <SealCountdown now={now} />
            </span>
          </SettingsRow>
          <SettingsRow
            description="At seal, a day without a cover gets one from the gallery, so the calendar stays full."
            title="Give coverless days a gallery cover"
          >
            <Switch
              aria-label="Give coverless days a gallery cover"
              checked={galleryCovers}
              onCheckedChange={setGalleryCovers}
            />
          </SettingsRow>
        </SettingsRows>
      </SettingsGroup>
    </>
  );
}
