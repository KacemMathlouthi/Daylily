import { Button } from "@daylily/ui/primitives/button";
import type { ReactNode } from "react";
import type { UpdateState } from "../../../../shared/channels";
import { DOWNLOADS, LINKS } from "../../lib/links";
import { checkForUpdate, installUpdate, useUpdates } from "../../lib/updates";
import { SettingsGroup, SettingsRow, SettingsRows } from "./parts";

const TIME = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

/** Paper's 30px pills in a settings row. */
const PILL = "h-7.5 px-3.5 py-0 text-caption";

function WhatsNew() {
  return (
    <a
      className="px-2 font-medium text-caption text-ink-soft hover:text-ink"
      href={LINKS.changelog}
      rel="noreferrer"
      target="_blank"
    >
      What’s new
    </a>
  );
}

function QuietButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button className={PILL} onClick={onClick} size="pill-sm" variant="paper">
      {children}
    </Button>
  );
}

/** One row of the Updates group: what's happening, and the one thing to do about it. */
function UpdateRow({
  state,
  version,
}: {
  state: UpdateState;
  version: string;
}) {
  switch (state.status) {
    case "checking":
      return (
        <SettingsRow
          description={`Daylily ${version}`}
          title="Looking for a new version…"
        />
      );
    case "downloading":
      return (
        <div className="flex flex-col gap-2.25 px-4 py-3.25">
          <SettingsRow
            description={`${state.percent}% · you can keep writing`}
            title={`Downloading Daylily ${state.version}`}
          />
          <div className="-mt-1 h-1 overflow-hidden rounded-full bg-paper-tint">
            <div
              className="h-full rounded-full bg-daylily transition-[width] duration-calm ease-soft"
              style={{ width: `${state.percent}%` }}
            />
          </div>
        </div>
      );
    case "ready":
      return (
        <SettingsRow
          description="Downloaded. It installs when you quit Daylily."
          title={`Daylily ${state.version} is ready`}
        >
          <div className="flex shrink-0 items-center gap-1">
            <WhatsNew />
            <Button
              className={PILL}
              onClick={installUpdate}
              size="pill-sm"
              variant="ink"
            >
              Restart now
            </Button>
          </div>
        </SettingsRow>
      );
    case "available":
      return (
        <SettingsRow
          description="Download it to replace this one. Your journal stays where it is."
          title={`Daylily ${state.version} is out`}
        >
          <div className="flex shrink-0 items-center gap-1">
            <WhatsNew />
            <Button
              className={PILL}
              nativeButton={false}
              render={
                <a
                  href={DOWNLOADS[state.download]}
                  rel="noreferrer"
                  target="_blank"
                />
              }
              size="pill-sm"
              variant="ink"
            >
              Download
            </Button>
          </div>
        </SettingsRow>
      );
    case "error":
      return (
        <SettingsRow
          description="Maybe you’re offline. Daylily will try again later."
          title="Couldn’t look for updates"
        >
          <QuietButton onClick={checkForUpdate}>Try again</QuietButton>
        </SettingsRow>
      );
    case "latest":
      return (
        <SettingsRow
          description={`Daylily ${version} · checked at ${TIME.format(new Date(state.checkedAt))}`}
          title="You have the latest version"
        >
          <QuietButton onClick={checkForUpdate}>Check now</QuietButton>
        </SettingsRow>
      );
    case "off":
      return (
        <SettingsRow
          description="A development build doesn’t update itself."
          title={`Daylily ${version}`}
        />
      );
    default:
      return (
        <SettingsRow description={`Daylily ${version}`} title="Updates">
          <QuietButton onClick={checkForUpdate}>Check now</QuietButton>
        </SettingsRow>
      );
  }
}

/** Paper's "09f" and "09g": where updating stands, in About. */
export function UpdatesGroup({ version }: { version: string }) {
  const state = useUpdates();
  if (state === null) {
    return null;
  }
  return (
    <SettingsGroup
      label="Updates"
      note="Daylily looks for a new version each time it opens, and every few hours after. Updates never interrupt your writing."
    >
      <SettingsRows>
        <UpdateRow state={state} version={version} />
      </SettingsRows>
    </SettingsGroup>
  );
}
