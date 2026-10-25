import { Menu } from "electron";

/**
 * macOS's menu bar: its standard menus, and Help › Welcome to Daylily to go
 * through onboarding again. Windows and Linux draw their menus in Daylily's
 * own title strip instead.
 */
export function setMacMenu(openWelcome: () => void) {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      { role: "appMenu" },
      { role: "fileMenu" },
      { role: "editMenu" },
      { role: "viewMenu" },
      { role: "windowMenu" },
      {
        role: "help",
        submenu: [{ click: openWelcome, label: "Welcome to Daylily" }],
      },
    ])
  );
}
