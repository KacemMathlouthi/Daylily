import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { FLOWER_CLASS } from "@daylily/ui/components/garden";
import type { JournalDay } from "../../lib/journal";

/**
 * What a day's tile shows when it has no cover (Paper: "05f"): its flower in its
 * colour, or pale when the file can't be read.
 */
export function TileFlower({ day }: { day: JournalDay }) {
  return (
    <DaylilyMark
      className={
        day.state === "unreadable"
          ? "text-flower-pale"
          : FLOWER_CLASS[day.color]
      }
      size={26}
    />
  );
}
