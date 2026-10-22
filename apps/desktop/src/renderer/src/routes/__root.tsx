import { SidebarInset, SidebarProvider } from "@daylily/ui/primitives/sidebar";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { AppSidebar } from "../components/app-sidebar";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: AppShell,
  }
);

/** Paper's sidebar is 248px wide */
const SIDEBAR_WIDTH = { "--sidebar-width": "15.5rem" } as CSSProperties;

function AppShell() {
  return (
    <SidebarProvider className="h-full min-h-0" style={SIDEBAR_WIDTH}>
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
  );
}
