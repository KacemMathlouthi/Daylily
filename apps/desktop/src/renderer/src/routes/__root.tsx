import { SidebarInset, SidebarProvider } from "@daylily/ui/primitives/sidebar";
import { TooltipProvider } from "@daylily/ui/primitives/tooltip";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { type CSSProperties, useCallback, useEffect, useState } from "react";
import { AppSidebar } from "../components/app-sidebar";
import { SearchDialog } from "../components/search/search-dialog";
import { TITLE_STRIP_HEIGHT, TitleStrip } from "../components/title-strip";
import { useFocusMode } from "../lib/focus-mode";
import { useFlowerColors } from "../lib/journal";
import { openSearch } from "../lib/search";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: AppShell,
  }
);

/** Windows and Linux get Daylily's own title strip; macOS keeps its traffic lights. */
const HAS_TITLE_STRIP = window.daylily.platform !== "darwin";

/** Paper's sidebar is 248px wide, and 56px as a rail; both start below the title strip */
const SHELL_SIZE = {
  "--sidebar-width": "15.5rem",
  "--sidebar-width-icon": "3.5rem",
  "--title-strip": HAS_TITLE_STRIP ? TITLE_STRIP_HEIGHT : "0px",
} as CSSProperties;

/** Kept in this computer's settings, so the app reopens as it was left. */
function useSidebarOpen() {
  const [open, setOpen] = useState(
    () => window.daylily.device.initial.sidebarOpen
  );
  const change = useCallback((next: boolean) => {
    setOpen(next);
    window.daylily.device.set({ sidebarOpen: next });
  }, []);
  return [open, change] as const;
}

/**
 * ⌘N / Ctrl+N opens today's page from anywhere, as Home's button promises,
 * ⌘K / Ctrl+K opens search, as the sidebar says, and ⌘, / Ctrl+, opens
 * Settings, as the File menu says.
 */
function useAppShortcuts() {
  const navigate = useNavigate();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) {
        return;
      }
      if (event.key === "n") {
        event.preventDefault();
        navigate({ to: "/today" });
      } else if (event.key === "k") {
        event.preventDefault();
        openSearch();
      } else if (event.key === ",") {
        event.preventDefault();
        navigate({ search: { section: "journal" }, to: "/settings" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    // The evening reminder, clicked, opens today's page
    const stopOpening = window.daylily.app.onOpenToday(() =>
      navigate({ to: "/today" })
    );
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      stopOpening();
    };
  }, [navigate]);
}

function AppShell() {
  const [open, setOpen] = useSidebarOpen();
  useFlowerColors(Route.useRouteContext().queryClient);
  const [focused] = useFocusMode();
  useAppShortcuts();

  return (
    <TooltipProvider>
      <SidebarProvider
        className="h-full min-h-0 pt-(--title-strip)"
        onOpenChange={setOpen}
        open={open}
        style={SHELL_SIZE}
      >
        {HAS_TITLE_STRIP ? <TitleStrip /> : null}
        {/* Focus mode leaves only the page */}
        {focused ? null : <AppSidebar />}
        <SidebarInset className="relative min-w-0 overflow-y-auto bg-paper-page">
          {/*
           * macOS hides the title bar, so this strip drags the window there. It overlays the
           * page, which keeps its own top space. Elsewhere the window has its own frame, and
           * drag regions would swallow the cursor styles.
           */}
          {window.daylily.platform === "darwin" ? (
            <div className="absolute inset-x-0 top-0 z-10 h-12 [-webkit-app-region:drag]" />
          ) : null}
          <Outlet />
        </SidebarInset>
        <SearchDialog />
      </SidebarProvider>
    </TooltipProvider>
  );
}
