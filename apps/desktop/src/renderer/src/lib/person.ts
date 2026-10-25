import { useQuery } from "@tanstack/react-query";
import { useJournalInfo } from "./journal-info";

/** This computer's name for the person using it, read once. */
export function useComputerName() {
  const { data } = useQuery({
    queryFn: () => window.daylily.app.info(),
    queryKey: ["app", "info"],
  });
  return data?.userName ?? null;
}

/**
 * What Daylily calls the person who writes: the name they chose, kept with the
 * journal, or their computer's name for them.
 */
export function usePersonName() {
  const chosen = useJournalInfo()?.config.name ?? null;
  const computer = useComputerName();
  return chosen ?? computer;
}
