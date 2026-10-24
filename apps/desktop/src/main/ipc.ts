import { writeFile } from "node:fs/promises";
import { userInfo } from "node:os";
import { join } from "node:path";
import {
  app,
  BrowserWindow,
  dialog,
  type IpcMainEvent,
  type IpcMainInvokeEvent,
  ipcMain,
  nativeImage,
  type WebContents,
} from "electron";
import { CHANNELS } from "../shared/channels";
import { appInfoSchema, imageNameSchema, pngSchema } from "../shared/schemas";

/** Only answer requests that come from our own renderer, never from other frames. */
export function isTrustedSender(event: IpcMainEvent | IpcMainInvokeEvent) {
  const url = event.senderFrame?.url ?? "";
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  return (
    url.startsWith("file://") ||
    (devUrl !== undefined && url.startsWith(devUrl))
  );
}

export function handle<T>(
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

/**
 * Calls `onReady` once the app in `contents` says it has painted. Returns a way
 * to stop listening, which also happens on its own if the window goes away.
 */
export function whenAppReady(contents: WebContents, onReady: () => void) {
  const stop = () => {
    ipcMain.off(CHANNELS.appReady, listener);
    contents.off("destroyed", stop);
  };
  const listener = (event: IpcMainEvent) => {
    if (event.sender === contents && isTrustedSender(event)) {
      stop();
      onReady();
    }
  };
  ipcMain.on(CHANNELS.appReady, listener);
  contents.once("destroyed", stop);
  return stop;
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

/** The share card is 2160 square; anything far beyond that isn't one. */
const MAX_IMAGE_SIDE = 8192;

export function registerIpc() {
  handle(CHANNELS.appInfo, () =>
    appInfoSchema.parse({
      platform: process.platform,
      userName: firstName(userInfo().username),
      version: app.getVersion(),
    })
  );

  handle(CHANNELS.saveGardenImage, async (event, rawPng, rawName) => {
    const png = pngSchema.parse(rawPng);
    const name = imageNameSchema.parse(rawName);
    // Decode it: only a real image of a sensible size is written as a .png
    const image = nativeImage.createFromBuffer(Buffer.from(png));
    const { width, height } = image.getSize();
    if (image.isEmpty() || width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE) {
      throw new Error("Rejected an image that is not a share card");
    }
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
      return false;
    }
    const { canceled, filePath } = await dialog.showSaveDialog(window, {
      defaultPath: join(app.getPath("pictures"), `${name}.png`),
      filters: [{ extensions: ["png"], name: "PNG image" }],
    });
    if (canceled || !filePath) {
      return false;
    }
    await writeFile(filePath, png);
    return true;
  });
}
