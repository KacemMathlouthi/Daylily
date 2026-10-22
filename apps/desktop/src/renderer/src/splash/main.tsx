import "../styles.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { startTheme } from "../lib/theme";
import { SplashScreen } from "./splash-screen";

// The same theme the app will open in, read from the same saved choice
startTheme();

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <SplashScreen />
    </StrictMode>
  );
}
