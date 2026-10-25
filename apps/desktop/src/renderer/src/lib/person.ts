import { useQuery } from "@tanstack/react-query";
import { useJournalInfo } from "./journal-info";

/** This computer's name for the person using it, read once. */
export function useComputerName() {
  const { data } = useQuery({
    queryFn: () => window.daylily.app.info(),
    queryKey: ["app", "info"],
    staleTime: Number.POSITIVE_INFINITY,
  });
  return data?.userName ?? null;
}

/**
 * What Daylily calls the person who writes: the name they chose, kept with the
 * journal, or their computer's name for them.
 */
export function usePersonName() {
  const info = useJournalInfo();
  const computer = useComputerName();
  // Nothing until the journal is read, so a chosen name never flickers in
  if (!info) {
    return null;
  }
  return info.config.name ?? computer;
}
