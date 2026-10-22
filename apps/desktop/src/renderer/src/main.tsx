import "./styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LaunchScreen } from "./components/launch/launch-screen";
import { startTheme } from "./lib/theme";
import { routeTree } from "./route-tree.gen";

// Before React renders; the first paint is the launch screen, which is light in both themes
startTheme();

const queryClient = new QueryClient();

// Hash history works when the app is loaded from a file:// URL in production
const router = createRouter({
  context: { queryClient },
  history: createHashHistory(),
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {/* Over the app, which renders underneath so it's ready when the screen fades */}
        <LaunchScreen />
      </QueryClientProvider>
    </StrictMode>
  );
}
