import { join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";

export default defineConfig({
  // Everything is bundled into out/, so the packaged app ships without node_modules
  main: { build: { externalizeDeps: false } },
  preload: {},
  renderer: {
    // Two pages: the app, and the splash window that shows while it loads
    build: {
      rollupOptions: {
        input: {
          index: join(import.meta.dirname, "src/renderer/index.html"),
          splash: join(import.meta.dirname, "src/renderer/splash.html"),
        },
      },
    },
    plugins: [
      // Paths are relative to the renderer root, src/renderer
      tanstackRouter({
        autoCodeSplitting: true,
        generatedRouteTree: "src/route-tree.gen.ts",
        routesDirectory: "src/routes",
        target: "react",
      }),
      react(),
      tailwindcss(),
    ],
    // packages/ui brings its own React through pnpm peers; the app must use one copy
    resolve: { dedupe: ["react", "react-dom"] },
  },
});
