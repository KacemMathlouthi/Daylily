import { readFile, stat, writeFile } from "node:fs/promises";
import { userInfo } from "node:os";
import { basename, extname, join } from "node:path";
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
  imageNameSchema,
  pickedImageSchema,
  pngSchema,
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

/** The image types a cover can be, by extension. */
const COVER_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/** Larger than any photo a phone takes; it keeps a stray video or scan out of memory. */
const MAX_COVER_BYTES = 30 * 1024 * 1024;

export function registerIpc() {
  handle(CHANNELS.appInfo, () =>
    appInfoSchema.parse({
      platform: process.platform,
      userName: firstName(userInfo().username),
      version: app.getVersion(),
    })
  );

  handle(CHANNELS.pickCover, async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
      return null;
    }
    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
      defaultPath: app.getPath("pictures"),
      filters: [
        {
          extensions: Object.keys(COVER_TYPES).map((ext) => ext.slice(1)),
          name: "Images",
        },
      ],
      properties: ["openFile"],
    });
    const [filePath] = filePaths;
    if (canceled || !filePath) {
      return null;
    }
    const type = COVER_TYPES[extname(filePath).toLowerCase()];
    if (!type || (await stat(filePath)).size > MAX_COVER_BYTES) {
      return null;
    }
    const data = await readFile(filePath);
    return pickedImageSchema.parse({
      dataUrl: `data:${type};base64,${data.toString("base64")}`,
      name: basename(filePath),
    });
  });

  handle(CHANNELS.saveGardenImage, async (event, rawPng, rawName) => {
    const png = pngSchema.parse(rawPng);
    const name = imageNameSchema.parse(rawName);
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
