import { SidebarInset, SidebarProvider } from "@daylily/ui/primitives/sidebar";
import { TooltipProvider } from "@daylily/ui/primitives/tooltip";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { type CSSProperties, useCallback, useState } from "react";
import { AppSidebar } from "../components/app-sidebar";

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

/** Machine-local, like the window size; read once so the app reopens as it was left. */
const SIDEBAR_OPEN_KEY = "daylily:sidebar-open";

function useSidebarOpen() {
  const [open, setOpen] = useState(
    () => localStorage.getItem(SIDEBAR_OPEN_KEY) !== "false"
  );
  const change = useCallback((next: boolean) => {
    setOpen(next);
    localStorage.setItem(SIDEBAR_OPEN_KEY, String(next));
  }, []);
  return [open, change] as const;
}

function AppShell() {
  const [open, setOpen] = useSidebarOpen();

  return (
    <TooltipProvider>
      <SidebarProvider
        className="h-full min-h-0"
        onOpenChange={setOpen}
        open={open}
        style={SIDEBAR_SIZE}
      >
        <AppSidebar />
        <SidebarInset className="min-w-0 overflow-y-auto bg-paper-page">
          {/*
           * macOS hides the title bar, so this strip drags the window there. Elsewhere the
           * window has its own frame, and drag regions would swallow the cursor styles.
           */}
          <div
            className={`h-12 shrink-0 ${window.daylily.platform === "darwin" ? "[-webkit-app-region:drag]" : ""}`}
          />
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
