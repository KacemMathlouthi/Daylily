import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { JournalConfigChanges } from "../../../shared/channels";
import type { JournalConfig, JournalInfo } from "../../../shared/journal";
import { JOURNAL_INFO_KEY, useJournalInfo } from "./journal-info";

/** What a journal starts with, and what shows until its own preferences are read. */
const DEFAULTS: JournalConfig = {
  galleryCovers: true,
  ghostPrompts: true,
  name: null,
  reminder: { enabled: true, time: "21:00" },
};

/** Preferences with changes laid over them; a change left undefined keeps what was there. */
function withChanges(
  config: JournalConfig,
  changes: JournalConfigChanges
): JournalConfig {
  return {
    galleryCovers: changes.galleryCovers ?? config.galleryCovers,
    ghostPrompts: changes.ghostPrompts ?? config.ghostPrompts,
    name: changes.name === undefined ? config.name : changes.name,
    reminder: {
      enabled: changes.reminder?.enabled ?? config.reminder.enabled,
      time: changes.reminder?.time ?? config.reminder.time,
    },
  };
}

/**
 * The journal's preferences, kept in its `.daylily/config.json` so they travel
 * with it, and a way to change them: shown at once, then saved.
 */
export function useJournalConfig() {
  const client = useQueryClient();
  const config = useJournalInfo()?.config ?? DEFAULTS;
  const change = useCallback(
    async (changes: JournalConfigChanges) => {
      const shown = (next: JournalConfig) =>
        client.setQueryData<JournalInfo>(JOURNAL_INFO_KEY, (info) =>
          info ? { ...info, config: next } : info
        );
      const before = client.getQueryData<JournalInfo>(JOURNAL_INFO_KEY)?.config;
      if (before) {
        shown(withChanges(before, changes));
      }
      try {
        shown(await window.daylily.journal.setConfig(changes));
      } catch (error) {
        console.error("Could not save the journal's preferences", error);
        if (before) {
          shown(before);
        }
      }
    },
    [client]
  );
  return [config, change] as const;
}

/** Whether the quiet questions show while writing, and a way to change it. */
export function useGhostPrompts() {
  const [config, change] = useJournalConfig();
  const set = useCallback(
    (ghostPrompts: boolean) => change({ ghostPrompts }),
    [change]
  );
  return [config.ghostPrompts, set] as const;
}
