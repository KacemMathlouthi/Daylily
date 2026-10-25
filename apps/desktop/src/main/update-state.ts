import type { UpdateDownload, UpdateState } from "../shared/channels";

/** What the updater reports, reduced to what the app shows. */
export type UpdateEvent =
  | { type: "checking" }
  | { type: "none"; at: string }
  | { type: "found"; version: string }
  | { type: "progress"; percent: number }
  | { type: "downloaded"; version: string }
  | { type: "failed"; offline: boolean }
  | { type: "dismissed" };

export interface UpdateContext {
  /** The version whose card was put away, if any. */
  dismissedVersion: string | null;
  /** Where to send this copy for a new version, or null when it replaces itself. */
  download: UpdateDownload | null;
}

/** A new version known and waiting: downloaded, or out for this copy to download. */
function isWaiting(state: UpdateState) {
  return state.status === "ready" || state.status === "available";
}

/** The next state after `event`. Pure, so every path can be tested without Electron. */
export function nextUpdateState(
  state: UpdateState,
  event: UpdateEvent,
  context: UpdateContext
): UpdateState {
  switch (event.type) {
    case "checking":
      // A look while a version waits changes nothing on screen; it only confirms it
      return isWaiting(state) || state.status === "downloading"
        ? state
        : { status: "checking" };
    case "none":
      return state.status === "ready"
        ? state
        : { checkedAt: event.at, status: "latest" };
    case "found": {
      const dismissed = context.dismissedVersion === event.version;
      if (context.download) {
        return {
          dismissed,
          download: context.download,
          status: "available",
          version: event.version,
        };
      }
      // Already downloaded and waiting: a later look at the same version keeps it
      if (state.status === "ready" && state.version === event.version) {
        return state;
      }
      return { percent: 0, status: "downloading", version: event.version };
    }
    case "progress":
      return state.status === "downloading"
        ? {
            ...state,
            percent: Math.min(100, Math.max(0, Math.round(event.percent))),
          }
        : state;
    case "downloaded":
      return {
        dismissed: context.dismissedVersion === event.version,
        status: "ready",
        version: event.version,
      };
    case "failed":
      // A version already found still stands, whatever a later look says: offline is not gone
      return isWaiting(state)
        ? state
        : { offline: event.offline, status: "error" };
    case "dismissed":
      return state.status === "ready" || state.status === "available"
        ? { ...state, dismissed: true }
        : state;
    default:
      return state;
  }
}
