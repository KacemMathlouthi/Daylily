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
import { useFocusMode } from "../lib/focus-mode";
import { useFlowerColors } from "../lib/journal";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: AppShell,
  }
);

/** Paper's sidebar is 248px wide, and 56px as a rail */
const SIDEBAR_SIZE = {
  "--sidebar-width": "15.5rem",
  "--sidebar-width-icon": "3.5rem",
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

/** ⌘N / Ctrl+N opens today's page from anywhere, as Home's button promises. */
function useNewPageShortcut() {
  const navigate = useNavigate();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "n" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        navigate({ to: "/today" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);
}

function AppShell() {
  const [open, setOpen] = useSidebarOpen();
  useFlowerColors(Route.useRouteContext().queryClient);
  const [focused] = useFocusMode();
  useNewPageShortcut();

  return (
    <TooltipProvider>
      <SidebarProvider
        className="h-full min-h-0"
        onOpenChange={setOpen}
        open={open}
        style={SIDEBAR_SIZE}
      >
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
      </SidebarProvider>
    </TooltipProvider>
  );
}
