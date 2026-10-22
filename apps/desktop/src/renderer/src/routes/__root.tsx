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
        {/* A strip the window can be dragged by, above every screen */}
        <div className="h-12 shrink-0 [-webkit-app-region:drag]" />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
