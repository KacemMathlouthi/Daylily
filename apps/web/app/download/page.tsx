import { DaylilyMark } from "@daylily/ui/components/daylily-mark";
import type { Metadata } from "next";
import Image from "next/image";
import { AppSchema } from "@/components/site/app-schema";
import { ButtonLink } from "@/components/site/button-link";
import { Footer } from "@/components/site/footer";
import { GithubMark } from "@/components/site/github-mark";
import { HeaderSpacer } from "@/components/site/header-spacer";
import { GITHUB_URL } from "@/components/site/links";
import { Reveal } from "@/components/site/motion";
import {
  latestRelease,
  megabytes,
  RELEASES_URL,
  type Release,
} from "@/lib/release";
import { pageMetadata } from "@/lib/site";
import { DownloadButton, type DownloadChoices } from "./download-button";

export const metadata: Metadata = pageMetadata({
  description:
    "Download Daylily for macOS, Windows and Linux. No account, no cloud. Your journal is a folder on your machine.",
  path: "/download",
  title: "Download · Daylily",
});

/** How each release file is told apart; the names come from electron-builder.yml. */
const FILES = {
  appImage: /\.AppImage$/,
  checksums: /^SHA256SUMS$/,
  deb: /\.deb$/,
  macArm: /-arm64\.dmg$/,
  macIntel: /-x64\.dmg$/,
  windows: /-setup\.exe$/,
};

const PLATFORMS = [
  {
    files: [
      { kind: "Apple silicon", pattern: FILES.macArm },
      { kind: "Intel", pattern: FILES.macIntel },
    ],
    icon: "/images/icons/macos.png",
    name: "macOS",
    requires: "macOS 13 Ventura or later",
  },
  {
    files: [{ kind: "Installer", pattern: FILES.windows }],
    icon: "/images/icons/windows.png",
    name: "Windows",
    requires: "Windows 10 or later · x64",
  },
  {
    files: [
      { kind: "AppImage", pattern: FILES.appImage },
      { kind: "Debian package", pattern: FILES.deb },
    ],
    icon: "/images/icons/linux.png",
    name: "Linux",
    requires: "Ubuntu 22.04, Fedora 39 or similar · x64",
  },
];

type Platform = (typeof PLATFORMS)[number];

function findAsset(release: Release | null, pattern: RegExp) {
  return release?.assets.find((asset) => pattern.test(asset.name));
}

/** The release's date, the same for every visitor wherever they are. */
function publishedOn(release: Release) {
  return new Date(release.published).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });
}

/** The hero button for each kind of computer; without a release, each goes to GitHub's list. */
function downloadChoices(release: Release | null): DownloadChoices {
  const choice = (label: string, pattern: RegExp, chip: string) => {
    const asset = findAsset(release, pattern);
    if (!(release && asset)) {
      return {
        label,
        meta: "Every version is on GitHub",
        url: RELEASES_URL,
      };
    }
    return {
      label,
      meta: `Version ${release.version} · ${publishedOn(release)} · ${chip} · ${megabytes(asset.size)}`,
      url: asset.url,
    };
  };
  return {
    linux: choice("Download for Linux", FILES.appImage, "AppImage"),
    mac: choice("Download for Mac", FILES.macArm, "Apple silicon"),
    "mac-intel": choice("Download for Mac", FILES.macIntel, "Intel"),
    other: {
      label: "See every download",
      meta: "Daylily is for macOS, Windows and Linux computers",
      url: "#platforms",
    },
    windows: choice("Download for Windows", FILES.windows, "x64"),
  };
}

const NOTES = [
  {
    body: "A calm editor with a title and a cover. It opens on “How was your day?” and saves as you type.",
    color: "text-daylily",
    title: "Today’s page",
  },
  {
    body: "When the day ends, at 4am, the page seals and stays honest, like ink. Past days open, but never change.",
    color: "text-petal",
    title: "Sealed at 4am",
  },
  {
    body: "Every day you write plants a flower. Scroll back through covers and titles like a photo album.",
    color: "text-saffron",
    title: "Garden and calendar",
  },
  {
    body: "Each day is a markdown file in a folder you choose. Open it in any editor, today or in twenty years.",
    color: "text-cornflower",
    title: "Plain files you own",
  },
  {
    body: "“How was your day?” at 9pm. Change the time, or turn it off. It never mentions a missed day.",
    color: "text-moss",
    title: "A gentle evening nudge",
  },
];

function DownloadHero({ release }: { release: Release | null }) {
  return (
    <Reveal className="flex flex-col items-center gap-7 px-5 pt-14 pb-24 text-center md:pt-22">
      <Image
        alt="The Daylily app icon"
        className="size-28 md:size-33"
        height={256}
        priority
        src="/images/icons/macos.png"
        width={256}
      />
      <div className="flex flex-col items-center gap-4.5">
        <h1 className="font-display text-fluid-page text-ink leading-display tracking-display-tight">
          Daylily for your desk.
        </h1>
        <p className="max-w-140 text-body text-ink-soft leading-7.5 md:text-lead">
          One page a day, on macOS, Windows and Linux. No account, no cloud.
          Your journal is a folder on your machine.
        </p>
      </div>
      <DownloadButton choices={downloadChoices(release)} />
    </Reveal>
  );
}

function PlatformCard({
  platform,
  release,
}: {
  platform: Platform;
  release: Release | null;
}) {
  const checksums = findAsset(release, FILES.checksums);
  return (
    <div className="flex w-full flex-col gap-6 rounded-3xl border border-line bg-paper-page p-8 shadow-tile">
      <div className="flex items-center gap-4">
        <Image
          alt=""
          className="size-16"
          height={256}
          src={platform.icon}
          width={256}
        />
        <div className="flex flex-col gap-0.5">
          <h2 className="font-display text-ink text-title leading-9.5 tracking-title">
            {platform.name}
          </h2>
          <p className="text-ink-subtle text-ui-lg">{platform.requires}</p>
        </div>
      </div>
      <ul className="flex grow flex-col gap-3.5 border-line border-t pt-4">
        {platform.files.map((file) => {
          const asset = findAsset(release, file.pattern);
          return (
            <li
              className="flex items-center justify-between gap-3"
              key={file.kind}
            >
              <div className="flex min-w-0 flex-col gap-0.75">
                <span className="font-medium text-body-sm text-ink">
                  {file.kind}
                </span>
                <span className="truncate font-mono text-ink-subtle text-xs">
                  {asset
                    ? `${asset.name} · ${megabytes(asset.size)}`
                    : "On GitHub Releases"}
                </span>
              </div>
              <ButtonLink
                href={asset?.url ?? RELEASES_URL}
                size="pill-sm"
                variant="paper"
              >
                Download
              </ButtonLink>
            </li>
          );
        })}
      </ul>
      {checksums && (
        <a
          className="font-mono text-ink-faint text-tag underline-offset-3 hover:text-ink-muted hover:underline"
          href={checksums.url}
        >
          SHA-256 checksums
        </a>
      )}
    </div>
  );
}

function ReleaseNotes() {
  return (
    <section className="border-line border-t px-5 pt-24 pb-30 md:px-30">
      <div className="mx-auto flex max-w-300 flex-col gap-12 lg:flex-row lg:gap-30">
        <Reveal className="flex flex-col gap-3.5 lg:w-105 lg:shrink-0">
          <p className="font-medium text-daylily text-ui">What’s in 0.1</p>
          <h2 className="font-display text-display-sm text-ink leading-heading-loose tracking-heading md:text-display">
            The human core, first.
          </h2>
          <p className="text-base text-ink-muted leading-6.5">
            Version 0.1 is everything you need to write every day. Search, sync
            and AI arrive later, and AI stays optional.
          </p>
        </Reveal>
        <ul className="flex grow flex-col">
          {NOTES.map((note) => (
            <li
              className="flex gap-5 border-line border-b py-5.5 last:border-b-0"
              key={note.title}
            >
              <DaylilyMark
                className={`mt-1 shrink-0 ${note.color}`}
                size={18}
              />
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-ink text-title-xs leading-7.5">
                  {note.title}
                </h3>
                <p className="text-body-sm text-ink-muted leading-6">
                  {note.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BuildFromSource() {
  return (
    <section className="px-4 md:px-16">
      <Reveal className="mx-auto flex max-w-328 flex-col items-start justify-between gap-8 rounded-card-lg bg-ink px-6 py-12 md:flex-row md:items-center md:px-16 md:py-14">
        <div className="flex max-w-140 flex-col gap-3">
          <p className="font-medium text-saffron text-ui">Open source</p>
          <h2 className="font-display text-display-xs text-on-ink leading-12 tracking-heading-sm md:text-display-sm">
            Build it yourself.
          </h2>
          <p className="text-body-sm text-on-ink-muted leading-6">
            Every line is on GitHub under AGPL-3.0, with instructions to build
            Daylily from source.
          </p>
        </div>
        <ButtonLink href={GITHUB_URL} size="pill-lg" variant="paper">
          <GithubMark />
          View on GitHub
        </ButtonLink>
      </Reveal>
    </section>
  );
}

export default async function DownloadPage() {
  const release = await latestRelease();
  return (
    <>
      <AppSchema />
      <main className="bg-dawn-glow bg-paper-raised bg-no-repeat pb-10">
        <HeaderSpacer />
        <DownloadHero release={release} />
        <div
          className="mx-auto grid max-w-328 scroll-mt-28 gap-5 px-4 pb-30 md:grid-cols-3 md:px-0"
          id="platforms"
        >
          {PLATFORMS.map((platform, index) => (
            <Reveal className="flex" delay={index * 0.08} key={platform.name}>
              <PlatformCard platform={platform} release={release} />
            </Reveal>
          ))}
        </div>
        <ReleaseNotes />
        <BuildFromSource />
      </main>
      <Footer />
    </>
  );
}
