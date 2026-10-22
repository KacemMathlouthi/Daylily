import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
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
