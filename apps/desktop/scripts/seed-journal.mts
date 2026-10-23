import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { systemClock } from "@daylily/core/clock";
import { dayPath, parseDayKey } from "@daylily/core/day";
import { writeDayFile } from "@daylily/core/day-file";
import { sealDayFile, sealTime } from "@daylily/core/seal";
import { instantAt } from "@daylily/core/zone";
import { writeFileAtomic } from "../src/main/journal/atomic-write";
import { mockPage } from "../src/renderer/src/mock/pages";
import {
  type SampleDay,
  sampleDays,
} from "../src/renderer/src/mock/sample-days";
import {
  journalFolder,
  manifestPath,
  type SeedManifest,
  sha256,
} from "./seed-manifest";

/**
 * Fills a journal with the sample year and a half, as sealed days with covers,
 * for trying the app with history. Days already written are left alone, and the
 * manifest lets `journal:unseed` take back exactly what was added.
 */

const COVERS = join(import.meta.dirname, "../src/renderer/src/mock/covers");

const exists = (path: string) =>
  access(path).then(
    () => true,
    () => false
  );

async function seedDay(
  journal: string,
  key: string,
  day: SampleDay,
  zone: string
): Promise<SeedManifest["files"]> {
  const dayKey = parseDayKey(key);
  if (!dayKey) {
    throw new Error(`Not a day: ${key}`);
  }
  const [year = "", month = "", date = "", file] = dayPath(dayKey);
  const folder = [year, month, date];
  if (await exists(join(journal, ...dayPath(dayKey)))) {
    return [];
  }

  const [y, m, d] = key.split("-").map(Number);
  const wrote = instantAt(
    {
      day: d ?? 1,
      hour: day.hour,
      minute: 12,
      month: m ?? 1,
      second: 0,
      year: y ?? 0,
    },
    zone
  );
  const page = writeDayFile(
    null,
    { body: mockPage(key, day), cover: "cover.webp", title: day.title },
    { app: "daylily/seed", now: wrote, timeZone: zone }
  );
  if (!page.ok) {
    throw new Error(`Could not write ${key}`);
  }
  const sealed = await sealDayFile(page.value, {
    cover: null,
    sealed: sealTime(dayKey, zone),
  });
  if (!sealed.ok) {
    throw new Error(`Could not seal ${key}`);
  }

  const cover = await readFile(join(COVERS, `oct-${day.coverId}.webp`));
  const files: [string, string | Uint8Array][] = [
    ["cover.webp", cover],
    [file, sealed.value],
  ];
  await Promise.all(
    files.map(([name, data]) =>
      writeFileAtomic(join(journal, ...folder, name), data)
    )
  );
  return files.map(([name, data]) => ({
    path: [...folder, name].join("/"),
    sha256: sha256(data),
  }));
}

const target = journalFolder();
if (await exists(manifestPath(target))) {
  console.error(
    `${target} is already seeded. Run journal:unseed first to start over.`
  );
  process.exit(1);
}

const deviceZone = systemClock.timeZone();
const days = [...sampleDays()];
const written = await Promise.all(
  days.map(([key, day]) => seedDay(target, key, day, deviceZone))
);
const files = written.flat();
const manifest: SeedManifest = {
  files,
  seeded: new Date().toISOString(),
};
await writeFileAtomic(
  manifestPath(target),
  `${JSON.stringify(manifest, null, 2)}\n`
);

const skipped = days.length - written.filter((day) => day.length > 0).length;
console.log(
  `Seeded ${days.length - skipped} sample days into ${target}` +
    (skipped > 0
      ? `, leaving ${skipped} ${skipped === 1 ? "day" : "days"} already written alone.`
      : ".")
);
