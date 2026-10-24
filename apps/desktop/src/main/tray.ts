import { app, Menu, nativeImage, Tray } from "electron";

/**
 * Daylily's place in the tray (the menu bar on macOS) while it keeps running with
 * its window closed, for the evening reminder: open it again, or quit.
 */
export function backgroundTray({
  icon,
  open,
}: {
  /** The app icon's path; the tray draws it small. */
  icon: string;
  /** Shows the window, opening a new one if there's none. */
  open: () => void;
}) {
  let tray: Tray | null = null;

  return {
    /** Shows the tray icon while Daylily keeps running in the background, removes it otherwise. */
    show(shown: boolean) {
      if (!shown) {
        tray?.destroy();
        tray = null;
        return;
      }
      if (tray) {
        return;
      }
      const size = process.platform === "darwin" ? 16 : 32;
      tray = new Tray(
        nativeImage.createFromPath(icon).resize({ height: size, width: size })
      );
      tray.setToolTip("Daylily");
      tray.setContextMenu(
        Menu.buildFromTemplate([
          { click: open, label: "Open Daylily" },
          { type: "separator" },
          { click: () => app.quit(), label: "Quit Daylily" },
        ])
      );
      // Windows and Linux open on a click; macOS shows the menu instead
      tray.on("click", open);
    },
  };
}
