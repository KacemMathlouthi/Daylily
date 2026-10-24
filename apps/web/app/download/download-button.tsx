"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { AppleLogo } from "@/components/site/apple-logo";
import { ButtonLink } from "@/components/site/button-link";

interface DownloadChoice {
  label: string;
  /** The line under the button: version, date, chip and size. */
  meta: string;
  url: string;
}

export type DownloadChoices = Record<Computer, DownloadChoice>;

type Computer = "linux" | "mac" | "mac-intel" | "windows";

/** Chromium's client hints; the only way a page can tell an Intel Mac from Apple silicon. */
type NavigatorWithHints = Navigator & {
  userAgentData?: {
    getHighEntropyValues: (
      hints: string[]
    ) => Promise<{ architecture?: string }>;
  };
};

async function whichComputer(): Promise<Computer> {
  const agent = navigator.userAgent;
  if (agent.includes("Windows")) {
    return "windows";
  }
  if (agent.includes("Linux") && !agent.includes("Android")) {
    return "linux";
  }
  // Most Macs sold since 2020 are Apple silicon, and Safari can't say, so that's the default
  const hints = (navigator as NavigatorWithHints).userAgentData;
  const values = await hints
    ?.getHighEntropyValues(["architecture"])
    .catch(() => undefined);
  return values?.architecture === "x86" ? "mac-intel" : "mac";
}

/**
 * The page's main button, for the visitor's own computer. It's drawn for a Mac
 * on the server, then switches once the browser says what it's running on.
 */
export function DownloadButton({ choices }: { choices: DownloadChoices }) {
  const [computer, setComputer] = useState<Computer>("mac");
  useEffect(() => {
    whichComputer().then(setComputer);
  }, []);
  const choice = choices[computer];
  const isMac = computer === "mac" || computer === "mac-intel";

  return (
    <div className="flex flex-col items-center gap-4 pt-2">
      <ButtonLink href={choice.url} size="pill-lg" variant="ink">
        {isMac ? <AppleLogo /> : <Download aria-hidden="true" size={16} />}
        {choice.label}
      </ButtonLink>
      <p className="text-ink-muted text-ui">{choice.meta}</p>
    </div>
  );
}
