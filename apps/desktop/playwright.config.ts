import { defineConfig } from "@playwright/test";

/**
 * End-to-end tests on the app as built in `out/` (`pnpm test:e2e` builds it
 * first): a real window, a real journal folder, a real force-quit. One at a
 * time, since each test opens Daylily on a computer of its own.
 */
export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  testDir: "e2e",
  testMatch: "*.e2e.ts",
  timeout: 60_000,
  workers: 1,
});
