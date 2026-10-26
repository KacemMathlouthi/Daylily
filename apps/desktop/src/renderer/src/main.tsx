import "./styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { flushSaves } from "./lib/autosave";
import { followJournal, followJournalMoves } from "./lib/journal";
import { followNotes } from "./lib/notes";
import { startTheme } from "./lib/theme";
import { routeTree } from "./route-tree.gen";

// Before React renders, so the first paint is already in the right theme
startTheme(window.daylily.device.initial.theme, (theme) => {
  window.daylily.device.set({ theme });
});

const queryClient = new QueryClient();
followJournal(queryClient);
followJournalMoves(queryClient);
followNotes(queryClient);

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
      </QueryClientProvider>
    </StrictMode>
  );
}

// Nothing unsaved is left behind when the window loses focus, closes, or the computer sleeps
window.daylily.app.onFlush(flushSaves);
window.addEventListener("blur", () => {
  flushSaves();
});

// Two frames after the first render the app has painted; the splash window can hand over
requestAnimationFrame(() =>
  requestAnimationFrame(() => window.daylily.app.ready())
);
