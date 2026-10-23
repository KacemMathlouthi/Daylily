import { pathToFileURL } from "node:url";
import { net, protocol } from "electron";
import { JOURNAL_SCHEME } from "../../shared/journal";
import { parseAssetUrl } from "./asset-url";
import type { Journal } from "./store";

/** Must run before the app is ready, so the page can load images through the scheme. */
export function registerJournalScheme() {
  protocol.registerSchemesAsPrivileged([
    {
      privileges: { secure: true, standard: true, supportFetchAPI: true },
      scheme: JOURNAL_SCHEME,
    },
  ]);
}

/** Serves a day's cover and images to the page, and nothing else from the journal. */
export function serveJournalAssets(journal: Journal) {
  protocol.handle(JOURNAL_SCHEME, (request) => {
    const asset = parseAssetUrl(request.url);
    if (!asset) {
      return new Response(null, { status: 404 });
    }
    const file = journal.dayAsset(asset.day, asset.name);
    return net.fetch(pathToFileURL(file).toString());
  });
}
