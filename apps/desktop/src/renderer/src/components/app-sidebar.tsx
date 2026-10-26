import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { cn } from "@daylily/ui/lib/cn";
import { Kbd } from "@daylily/ui/primitives/kbd";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@daylily/ui/primitives/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@daylily/ui/primitives/tooltip";
import { Link, useMatchRoute } from "@tanstack/react-router";
import {
  Calendar,
  House,
  Lightbulb,
  type LucideIcon,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  Search,
  Settings,
  Sprout,
  Sun,
} from "lucide-react";
import type { ReactElement } from "react";
import { useJournalInfo } from "../lib/journal-info";
import { openSearch } from "../lib/search";
import { useTheme } from "../lib/theme";
import type { FileRoutesByTo } from "../route-tree.gen";
import { UpdateCard } from "./update-card";

type AppPath = keyof FileRoutesByTo;

const NAV: {
  to: AppPath;
  label: string;
  icon: LucideIcon;
  /** Another screen that belongs under this one, such as a sealed day under Calendar. */
  also?: AppPath;
}[] = [
  { icon: House, label: "Home", to: "/" },
  { icon: PenLine, label: "Today", to: "/today" },
  { icon: Lightbulb, label: "Thoughts", to: "/thoughts" },
  { also: "/day/$key", icon: Calendar, label: "Calendar", to: "/calendar" },
  { icon: Sprout, label: "Garden", to: "/garden" },
];

/** Paper's row: 30px tall, 13px medium labels, a muted icon that darkens when current. */
const ROW =
  "h-7.5 gap-2.25 rounded-row px-2.5 font-medium text-ui [&_svg]:size-3.75 [&_svg]:text-ink-muted data-active:[&_svg]:text-ink";

/** Hides chrome that only makes sense with labels, once the sidebar is a rail. */
const RAIL_HIDDEN = "group-data-[collapsible=icon]:hidden";

function NavItem({
  to,
  label,
  icon: Icon,
  also,
}: {
  to: AppPath;
  label: string;
  icon: LucideIcon;
  also?: AppPath | undefined;
}) {
  const matchRoute = useMatchRoute();
  const isActive = Boolean(
    matchRoute({ fuzzy: to !== "/", to }) ||
      (also && matchRoute({ fuzzy: true, to: also }))
  );

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={ROW}
        isActive={isActive}
        render={<Link to={to} />}
        tooltip={label}
      >
        <Icon strokeWidth={1.9} />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/** A tooltip to the right; `railOnly` keeps it quiet while the label is on screen. */
function SideTip({
  label,
  railOnly = false,
  children,
}: {
  label: string;
  railOnly?: boolean;
  children: ReactElement;
}) {
  const { state } = useSidebar();
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent hidden={railOnly && state !== "collapsed"} side="right">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/** A small icon-only control in the footer: the theme and collapse buttons. */
function FooterAction({
  label,
  icon: Icon,
  onClick,
  className,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}) {
  return (
    <SideTip label={label}>
      <button
        aria-label={label}
        className={cn(
          "flex size-6.5 shrink-0 items-center justify-center rounded-row text-ink-muted transition-colors duration-150 hover:bg-sidebar-accent hover:text-ink group-data-[collapsible=icon]:h-7.5 group-data-[collapsible=icon]:w-8",
          className
        )}
        onClick={onClick}
        type="button"
      >
        <Icon className="size-3.75" strokeWidth={1.9} />
      </button>
    </SideTip>
  );
}

/**
 * The app's left column, from the Home and Calendar screens in Paper, built on the
 * shadcn Sidebar. It folds into a rail of icons (05b in Paper) with ⌘B / Ctrl+B.
 */
export function AppSidebar() {
  const isMac = window.daylily.platform === "darwin";
  const { state, toggleSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const journal = useJournalInfo();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      // Below the title strip on Windows and Linux; it's 0 on macOS
      className="top-(--title-strip) h-[calc(100svh-var(--title-strip))] select-none"
      collapsible="icon"
    >
      <SidebarHeader className="gap-4.5 px-3 pt-3.5">
        {/* Room for the macOS traffic lights; the only part of the sidebar that drags the window */}
        {isMac ? <div className="h-5 [-webkit-app-region:drag]" /> : null}
        <SidebarMenu>
          <SidebarMenuItem>
            {/* The journal and where it lives; it opens its settings, as there's one journal to pick */}
            <SidebarMenuButton
              className="h-auto gap-2.25 px-2 py-1.25"
              render={<Link search={{ section: "journal" }} to="/settings" />}
              tooltip="Your journal"
            >
              <DaylilyMark className="shrink-0 text-daylily" size={18} />
              <span className="flex min-w-0 flex-col gap-px">
                <span className="font-semibold text-ink text-ui-lg leading-4.5">
                  Your journal
                </span>
                {journal ? (
                  <span className="truncate text-ink-subtle text-meta leading-3.5">
                    {journal.displayRoot}
                  </span>
                ) : null}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SideTip label="Search days" railOnly>
          <button
            aria-label="Search days"
            className="flex h-7.5 items-center gap-2 rounded-row border border-line bg-paper-page px-2.5 text-left transition-colors duration-150 hover:border-ink-ghost group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            onClick={openSearch}
            type="button"
          >
            <Search
              className="shrink-0 text-ink-subtle"
              size={13}
              strokeWidth={2.2}
            />
            <span
              className={cn("grow text-caption text-ink-subtle", RAIL_HIDDEN)}
            >
              Search days
            </span>
            <Kbd
              className={cn(
                "bg-transparent px-0 font-sans text-ink-faint",
                RAIL_HIDDEN
              )}
            >
              {isMac ? "⌘K" : "Ctrl K"}
            </Kbd>
          </button>
        </SideTip>
      </SidebarHeader>
      <SidebarContent className="px-3 pt-4.5">
        <SidebarMenu className="gap-px">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="gap-2.5 px-3 pb-3.5">
        <UpdateCard />
        {/* A row beside Settings; in the rail they stack, theme first as in Paper */}
        <div className="flex items-center gap-0.5 group-data-[collapsible=icon]:flex-col">
          <SidebarMenu className="min-w-0 grow">
            <NavItem icon={Settings} label="Settings" to="/settings" />
          </SidebarMenu>
          <FooterAction
            className="group-data-[collapsible=icon]:order-first"
            icon={theme === "dark" ? Sun : Moon}
            label={theme === "dark" ? "Light mode" : "Dark mode"}
            onClick={toggleTheme}
          />
          <FooterAction
            icon={collapsed ? PanelLeftOpen : PanelLeftClose}
            label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleSidebar}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
