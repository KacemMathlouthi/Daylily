import { DOWNLOADS } from "../lib/links";
import { dismissUpdate, installUpdate, useUpdates } from "../lib/updates";

const ACTION = "font-semibold text-daylily-ink text-xs hover:underline";
const QUIET = "font-medium text-ink-muted text-xs hover:text-ink";

/**
 * Paper's "09f": a quiet card above Settings once a new version is ready, or
 * out where Daylily can't replace itself. "Not now" puts it away until the next one.
 */
export function UpdateCard() {
  const state = useUpdates();
  if (state === null) {
    return null;
  }
  if (
    !(state.status === "ready" || state.status === "available") ||
    state.dismissed
  ) {
    return null;
  }
  const ready = state.status === "ready";

  return (
    <div className="rounded-tile border border-daylily-wash-line bg-daylily-wash px-3 py-2.75 group-data-[collapsible=icon]:hidden">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="font-semibold text-caption text-ink leading-4">
          Daylily {state.version} is {ready ? "ready" : "out"}
        </p>
        <p className="text-ink-muted text-meta leading-3.75">
          {ready
            ? "It installs when you quit."
            : "Your journal stays as it is."}
        </p>
        <div className="flex gap-3 pt-1.25">
          {ready ? (
            <button className={ACTION} onClick={installUpdate} type="button">
              Restart now
            </button>
          ) : (
            <a
              className={ACTION}
              href={DOWNLOADS[state.download]}
              rel="noreferrer"
              target="_blank"
            >
              Download
            </a>
          )}
          <button className={QUIET} onClick={dismissUpdate} type="button">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
