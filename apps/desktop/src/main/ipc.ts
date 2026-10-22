import { app, type IpcMainInvokeEvent, ipcMain } from "electron";
import { CHANNELS } from "../shared/channels";
import { appInfoSchema } from "../shared/schemas";

/** Only answer requests that come from our own renderer, never from other frames. */
function isTrustedSender(event: IpcMainInvokeEvent) {
  const url = event.senderFrame?.url ?? "";
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  return (
    url.startsWith("file://") ||
    (devUrl !== undefined && url.startsWith(devUrl))
  );
}

function handle<T>(channel: string, handler: () => T | Promise<T>) {
  ipcMain.handle(channel, (event) => {
    if (!isTrustedSender(event)) {
      throw new Error(`Rejected ${channel} from an untrusted frame`);
    }
    return handler();
  });
}

export function registerIpc() {
  handle(CHANNELS.appInfo, () =>
    appInfoSchema.parse({
      platform: process.platform,
      version: app.getVersion(),
    })
  );
}
