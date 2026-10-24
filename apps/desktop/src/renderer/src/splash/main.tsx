import "../styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { asThemePreference, startTheme } from "../lib/theme";
import { SplashScreen } from "./splash-screen";

// The same theme the app will open in, passed in its address by the main process
startTheme(
  asThemePreference(new URLSearchParams(location.search).get("theme"))
);

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <SplashScreen />
    </StrictMode>
  );
}
