import { parseDayKey } from "@daylily/core/day";
import { type FlowerColor, flowerColor } from "@daylily/core/flower";
import { type QueryClient, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  journalAssetUrl,
  type ListedDay,
  type StoredDay,
} from "../../../shared/journal";
import { forgetSaves } from "./autosave";
import type { DayKey } from "./month";
import {
  forgetThoughts,
  forgetThoughtsOf,
  receiveThoughts,
  showsThoughtsOf,
} from "./thoughts";
import { followPageFile, forgetPages } from "./today-page";

/** A written day as the screens show it: calendar tiles, flowers, cards. */
export interface JournalDay {
  color: FlowerColor;
  /** Where its cover shows from; null for a day written without one. */
  cover: string | null;
  /** The page's opening words. */
  excerpt: string;
  /** The hour writing began, 0 to 23; null if unknown. */
  hour: number | null;
  /** "edited" when its seal no longer matches; "unreadable" when its file can't be read. */
  state: "open" | "sealed" | "edited" | "unreadable";
  title: string;
  words: number;
}

type Listing = ReadonlyMap<DayKey, ListedDay>;
type Days = ReadonlyMap<DayKey, JournalDay>;

const DAYS_KEY = ["journal", "days"] as const;
const dayKeyOf = (day: DayKey) => ["journal", "day", day] as const;
const NO_DAYS: Days = new Map();

async function listDays(): Promise<Listing> {
  const listed = await window.daylily.journal.list();
  return new Map(listed.map((day) => [day.day, day]));
}

function toScreens(listing: Listing): Days {
  return new Map(
    [...listing].map(([day, listed]) => [day, toJournalDay(listed)])
  );
}

/** A day as listed, with the address its cover loads from; a changed file gets a new one. */
function toJournalDay(listed: ListedDay): JournalDay {
  if (listed.state === "unreadable") {
    return {
      color: "daylily",
      cover: null,
      excerpt: "",
      hour: null,
      state: "unreadable",
      title: "",
      words: 0,
    };
  }
  return {
    color: listed.color ?? "daylily",
    cover: listed.cover
      ? `${journalAssetUrl(listed.day, listed.cover)}?v=${listed.coverStamp ?? ""}`
      : null,
    excerpt: listed.excerpt,
    hour: listed.hour,
    state: listed.state,
    title: listed.title,
    words: listed.words,
  };
}

/**
 * Every written day in the journal, by day, and whether it has been read yet:
 * until then `days` is empty, which isn't the same as a journal with none.
 */
export function useJournalListing(): { days: Days; ready: boolean } {
  const { data } = useQuery({
    queryFn: listDays,
    queryKey: DAYS_KEY,
    select: toScreens,
    staleTime: Number.POSITIVE_INFINITY,
  });
  return { days: data ?? NO_DAYS, ready: data !== undefined };
}

/** Every written day in the journal, by day; empty while it's first read. */
export function useJournalDays(): Days {
  return useJournalListing().days;
}

/** A day's page from its file (undefined while reading, null if nothing was written) and when it was read. */
export function useStoredDay(day: DayKey) {
  const { data, dataUpdatedAt } = useQuery({
    queryFn: async (): Promise<StoredDay | "unreadable" | null> => {
      const read = await window.daylily.journal.read(day);
      return read.ok ? read.value : "unreadable";
    },
    queryKey: dayKeyOf(day),
    staleTime: Number.POSITIVE_INFINITY,
  });
  // When it was read, so a page changed by another app is shown afresh
  return { day: data, readAt: dataUpdatedAt };
}

/** Puts a day as just read into the listing: changed, gone, or now unreadable. */
function applyRead(
  listing: Map<DayKey, ListedDay>,
  day: DayKey,
  read: Awaited<ReturnType<typeof window.daylily.journal.read>>
) {
  if (read.ok && read.value) {
    listing.set(day, read.value);
  } else if (read.ok) {
    listing.delete(day);
  } else {
    const checked = parseDayKey(day);
    if (checked) {
      listing.set(day, { day: checked, state: "unreadable" });
    }
  }
}

/**
 * Keeps the screens in step with the journal: when it moves to another folder,
 * everything is read again from there.
 */
export function followJournalMoves(client: QueryClient) {
  return window.daylily.journal.onSwitch(() => {
    forgetSaves();
    forgetPages();
    forgetThoughts();
    client.resetQueries({ queryKey: ["journal"] });
  });
}

/**
 * Keeps the screens in step with the folder: when files change, by Daylily or
 * any other app, the days they belong to are read again.
 */
export function followJournal(client: QueryClient) {
  return window.daylily.journal.onChange(async (changed) => {
    // Each day on its own, so one that can't be read doesn't hold back the rest
    const reads = await Promise.all(
      changed.map(async (day) => {
        try {
          return [day, await window.daylily.journal.read(day)] as const;
        } catch (error) {
          console.error("Could not read a changed day", error);
          return null;
        }
      })
    );
    if (!client.getQueryData(DAYS_KEY)) {
      // Still being listed, perhaps from before this change: list again
      client.invalidateQueries({ queryKey: DAYS_KEY });
    }
    client.setQueryData<Listing>(DAYS_KEY, (current) => {
      if (!current) {
        return current;
      }
      const next = new Map(current);
      for (const entry of reads) {
        if (entry) {
          applyRead(next, entry[0], entry[1]);
        }
      }
      return next;
    });
    for (const entry of reads) {
      if (entry) {
        followPageFile(entry[0], entry[1]);
      }
    }
    for (const day of changed) {
      client.invalidateQueries({ queryKey: dayKeyOf(day) });
    }
    await followThoughts(changed);
    client.invalidateQueries({ queryKey: ["journal", "stats"] });
  });
}

/** Reads again the thoughts of changed days the Thoughts screen holds or has read past. */
async function followThoughts(changed: DayKey[]) {
  await Promise.all(
    changed.filter(showsThoughtsOf).map(async (day) => {
      try {
        const found = await window.daylily.thoughts.read(day);
        if (found) {
          receiveThoughts(found);
        } else {
          forgetThoughtsOf(day);
        }
      } catch (error) {
        console.error("Could not read a day's thoughts", error);
      }
    })
  );
}

/** Small is enough to find a cover's colour, and quick to read. */
const SAMPLE_SIZE = 24;

function sampleCover(url: string) {
  return new Promise<FlowerColor>((resolve, reject) => {
    const image = new Image();
    // The journal's scheme allows reading pixels; without this the canvas would refuse
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = SAMPLE_SIZE;
      canvas.height = SAMPLE_SIZE;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        reject(new Error("Canvas 2D is unavailable"));
        return;
      }
      context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
      resolve(
        flowerColor(context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data)
      );
    };
    image.onerror = () => reject(new Error(`Could not load ${url}`));
    image.src = url;
  });
}

/** Samples one day's cover and keeps its colour, on screen and in the journal's cache. */
async function sampleDay(client: QueryClient, listed: ListedDay) {
  if (listed.state === "unreadable" || !listed.cover || !listed.coverStamp) {
    return;
  }
  const { day, coverStamp: stamp } = listed;
  const color = await sampleCover(
    `${journalAssetUrl(day, listed.cover)}?v=${stamp}`
  );
  await window.daylily.journal.flowerColor(day, stamp, color);
  client.setQueryData<Listing>(DAYS_KEY, (current) => {
    const entry = current?.get(day);
    if (!(current && entry) || entry.state === "unreadable") {
      return current;
    }
    // Only if the cover is still the one that was sampled
    return entry.coverStamp === stamp
      ? new Map(current).set(day, { ...entry, color })
      : current;
  });
}

const sampling = new Set<DayKey>();

/**
 * Gives each flower its cover's colour: covers not sampled yet are read one at a
 * time in the background, and the colour is kept in the journal's cache.
 */
export function useFlowerColors(client: QueryClient) {
  const listing = useQuery({
    queryFn: listDays,
    queryKey: DAYS_KEY,
    staleTime: Number.POSITIVE_INFINITY,
  }).data;
  useEffect(() => {
    const waiting = [...(listing?.values() ?? [])].filter(
      (listed) =>
        listed.state !== "unreadable" &&
        listed.cover !== null &&
        listed.coverStamp !== null &&
        listed.color === null &&
        !sampling.has(listed.day)
    );
    let cancelled = false;
    const next = async (index: number): Promise<void> => {
      const listed = waiting[index];
      if (cancelled || !listed) {
        return;
      }
      sampling.add(listed.day);
      try {
        await sampleDay(client, listed);
      } catch (error) {
        console.error("Could not sample a cover", error);
      } finally {
        sampling.delete(listed.day);
      }
      await next(index + 1);
    };
    next(0);
    return () => {
      cancelled = true;
    };
  }, [client, listing]);
}

/**
 * The journal's first day: its earliest page, or today before anything is
 * written. Days before it weren't rested, they came before the journal, so they
 * show as plain ground and never count as missed. While the journal is first
 * read it's the empty key, before every day, so nothing changes look as it loads.
 */
export function useJournalBegins(today: DayKey): DayKey {
  const { days, ready } = useJournalListing();
  return useMemo(() => {
    if (!ready) {
      return "";
    }
    let first = today;
    for (const key of days.keys()) {
      if (key < first) {
        first = key;
      }
    }
    return first;
  }, [days, ready, today]);
}
