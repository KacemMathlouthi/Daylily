import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { cn } from "@daylily/ui/lib/cn";
import {
  FileText,
  Lightbulb,
  type LucideIcon,
  PenLine,
  Search,
  Sprout,
} from "lucide-react";

/** The app's sidebar icons; ghost prompts have the flower the status bar shows. */
const ICONS: Record<string, LucideIcon> = {
  garden: Sprout,
  journaling: PenLine,
  notes: FileText,
  search: Search,
  thoughts: Lightbulb,
};

/** A feature's icon on its tile of paper, as the Features menu shows it. */
export function FeatureIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const Icon = ICONS[slug];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-paper-raised text-ink transition-colors duration-200",
        className
      )}
    >
      {Icon ? <Icon size={18} strokeWidth={1.8} /> : <DaylilyMark size={16} />}
    </span>
  );
}
