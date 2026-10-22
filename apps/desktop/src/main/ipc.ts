import { writeFile } from "node:fs/promises";
import { userInfo } from "node:os";
import { join } from "node:path";
import {
  app,
  BrowserWindow,
  dialog,
  type IpcMainInvokeEvent,
  ipcMain,
} from "electron";
import { CHANNELS } from "../shared/channels";
import {
  appInfoSchema,
  captureRectSchema,
  imageNameSchema,
} from "../shared/schemas";

/** Only answer requests that come from our own renderer, never from other frames. */
function isTrustedSender(event: IpcMainInvokeEvent) {
  const url = event.senderFrame?.url ?? "";
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  return (
    url.startsWith("file://") ||
    (devUrl !== undefined && url.startsWith(devUrl))
  );
}

function handle<T>(
  channel: string,
  handler: (event: IpcMainInvokeEvent, ...args: unknown[]) => T | Promise<T>
) {
  ipcMain.handle(channel, (event, ...args: unknown[]) => {
    if (!isTrustedSender(event)) {
      throw new Error(`Rejected ${channel} from an untrusted frame`);
    }
    return handler(event, ...args);
  });
}

const NAME_SEPARATORS = /[\s._-]+/;
const LETTERS_ONLY = /^\p{L}{2,}$/u;

/** "kacem" or "kacem.m" → "Kacem"; anything that doesn't read as a name → null. */
function firstName(username: string): string | null {
  const [first = ""] = username.split(NAME_SEPARATORS);
  if (!LETTERS_ONLY.test(first)) {
    return null;
  }
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export function registerIpc() {
  handle(CHANNELS.appInfo, () =>
    appInfoSchema.parse({
      platform: process.platform,
      userName: firstName(userInfo().username),
      version: app.getVersion(),
    })
  );

  handle(CHANNELS.saveGardenImage, async (event, rawRect, rawName) => {
    const rect = captureRectSchema.parse(rawRect);
    const name = imageNameSchema.parse(rawName);
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
      return false;
    }

    const image = await event.sender.capturePage({
      height: Math.round(rect.height),
      width: Math.round(rect.width),
      x: Math.round(rect.x),
      y: Math.round(rect.y),
    });
    const { canceled, filePath } = await dialog.showSaveDialog(window, {
      defaultPath: join(app.getPath("pictures"), `${name}.png`),
      filters: [{ extensions: ["png"], name: "PNG image" }],
    });
    if (canceled || !filePath) {
      return false;
    }
    await writeFile(filePath, image.toPNG());
    return true;
  });
}
