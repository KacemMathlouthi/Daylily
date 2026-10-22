import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import { Kbd } from "@daylily/ui/primitives/kbd";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@daylily/ui/primitives/sidebar";
import { Link, useMatchRoute } from "@tanstack/react-router";
import {
  Calendar,
  ChevronDown,
  House,
  type LucideIcon,
  PenLine,
  Search,
  Settings,
  Sprout,
} from "lucide-react";
import type { FileRoutesByTo } from "../route-tree.gen";

type AppPath = keyof FileRoutesByTo;

const NAV: { to: AppPath; label: string; icon: LucideIcon }[] = [
  { icon: House, label: "Home", to: "/" },
  { icon: PenLine, label: "Today", to: "/today" },
  { icon: Calendar, label: "Calendar", to: "/calendar" },
  { icon: Sprout, label: "Garden", to: "/garden" },
];

/** Paper's row: 30px tall, 13px medium labels, a muted icon that darkens when current. */
const ROW =
  "h-7.5 gap-2.25 rounded-row px-2.5 font-medium text-ui [&_svg]:size-3.75 [&_svg]:text-ink-muted data-active:[&_svg]:text-ink";

function NavItem({
  to,
  label,
  icon: Icon,
}: {
  to: AppPath;
  label: string;
  icon: LucideIcon;
}) {
  const matchRoute = useMatchRoute();
  const isActive = Boolean(matchRoute({ fuzzy: to !== "/", to }));

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={ROW}
        isActive={isActive}
        render={<Link to={to} />}
      >
        <Icon strokeWidth={1.9} />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/** The app's left column, from the Home screen in Paper, built on the shadcn Sidebar. */
export function AppSidebar() {
  const isMac = window.daylily.platform === "darwin";

  return (
    <Sidebar className="select-none">
      <SidebarHeader className="gap-4.5 px-3 pt-3.5">
        {/* Room for the macOS traffic lights; the only part of the sidebar that drags the window */}
        {isMac ? <div className="h-5 [-webkit-app-region:drag]" /> : null}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-8 gap-2.25 px-2 font-semibold text-ink text-ui-lg">
              <DaylilyMark className="text-daylily" size={18} />
              <span className="grow">Your journal</span>
              <ChevronDown
                className="size-3! text-ink-subtle"
                strokeWidth={2.2}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <button
          className="flex h-7.5 items-center gap-2 rounded-row border border-line bg-paper-page px-2.5 text-left transition-colors duration-150 hover:border-ink-ghost"
          type="button"
        >
          <Search className="text-ink-subtle" size={13} strokeWidth={2.2} />
          <span className="grow text-caption text-ink-subtle">Search days</span>
          <Kbd className="bg-transparent px-0 font-sans text-ink-faint">
            {isMac ? "⌘K" : "Ctrl K"}
          </Kbd>
        </button>
      </SidebarHeader>
      <SidebarContent className="px-3 pt-4.5">
        <SidebarMenu className="gap-px">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="px-3 pb-3.5">
        <SidebarMenu>
          <NavItem icon={Settings} label="Settings" to="/settings" />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
