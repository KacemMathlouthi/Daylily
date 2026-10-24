import { pathToFileURL } from "node:url";
import { net, protocol } from "electron";
import { JOURNAL_SCHEME } from "../../shared/journal";
import { parseAssetUrl } from "./asset-url";
import type { Journal } from "./store";

/** Must run before the app is ready, so the page can load images through the scheme. */
export function registerJournalScheme() {
  protocol.registerSchemesAsPrivileged([
    {
      // corsEnabled so the page can read a cover's pixels to colour its flower
      privileges: {
        corsEnabled: true,
        secure: true,
        standard: true,
        supportFetchAPI: true,
      },
      scheme: JOURNAL_SCHEME,
    },
  ]);
}

/** Serves a day's cover and images to the page, from whichever journal is open, and nothing else. */
export function serveJournalAssets(journal: () => Journal) {
  protocol.handle(JOURNAL_SCHEME, async (request) => {
    const asset = parseAssetUrl(request.url);
    if (!asset) {
      return new Response(null, { status: 404 });
    }
    const file = journal().dayAsset(asset.day, asset.name);
    const response = await net.fetch(pathToFileURL(file).toString());
    // Only Daylily's own pages load this scheme; they may read the pixels
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    return new Response(response.body, { headers, status: response.status });
  });
}
