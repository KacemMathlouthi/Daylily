import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ThoughtDay } from "../../../shared/journal";
import { flushSaves, forgetSaves } from "./autosave";
import {
  changeThought,
  forgetThoughts,
  leaveThought,
  receiveThoughts,
  startNextThought,
  thoughtEntries,
} from "./thoughts";

const TODAY = "2026-10-25";
const write = vi.fn();

function shown() {
  return thoughtEntries(TODAY).map((entry) =>
    entry.kind === "thought"
      ? {
          begun: entry.thought.begun,
          body: entry.thought.body,
          time: entry.thought.time,
        }
      : entry
  );
}

function openId() {
  const [top] = thoughtEntries(TODAY);
  if (top?.kind !== "thought") {
    throw new Error("No thought at the top");
  }
  return top.thought.id;
}

const day = (thoughts: { body: string; time: string }[]): ThoughtDay => ({
  day: TODAY as ThoughtDay["day"],
  state: "ok",
  thoughts,
});

beforeEach(() => {
  vi.useFakeTimers();
  write.mockReset();
  write.mockResolvedValue({ ok: true, value: null });
  vi.stubGlobal("window", { daylily: { thoughts: { write } } });
});

afterEach(() => {
  forgetSaves();
  forgetThoughts();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("the open thought", () => {
  it("waits for its first word, then takes the time and goes to the file", async () => {
    startNextThought(TODAY);
    expect(shown()).toEqual([{ begun: false, body: "", time: null }]);

    changeThought(TODAY, openId(), " ", new Date(2026, 9, 25, 14, 9));
    await flushSaves();
    expect(write).not.toHaveBeenCalled();

    changeThought(
      TODAY,
      openId(),
      "Sam laughed.",
      new Date(2026, 9, 25, 14, 10)
    );
    await flushSaves();
    expect(write).toHaveBeenCalledWith(TODAY, [
      { body: "Sam laughed.", time: "14:10" },
    ]);
  });

  it("keeps the time it began at as the words go on", () => {
    startNextThought(TODAY);
    const id = openId();
    changeThought(TODAY, id, "One", new Date(2026, 9, 25, 9, 0));
    changeThought(TODAY, id, "One more", new Date(2026, 9, 25, 9, 7));
    expect(shown()[0]).toMatchObject({ body: "One more", time: "09:00" });
  });

  it("is only ever one: asking again while it's empty goes back to it", () => {
    startNextThought(TODAY);
    startNextThought(TODAY);
    expect(shown()).toHaveLength(1);
  });

  it("opens a new one at the top once the last has words", () => {
    startNextThought(TODAY);
    changeThought(TODAY, openId(), "First.", new Date(2026, 9, 25, 9, 0));
    startNextThought(TODAY);
    expect(shown()).toEqual([
      { begun: false, body: "", time: null },
      { begun: true, body: "First.", time: "09:00" },
    ]);
  });
});

describe("thoughts read from the file", () => {
  it("are shown newest first", () => {
    receiveThoughts(
      day([
        { body: "Morning.", time: "08:00" },
        { body: "Afternoon.", time: "15:00" },
      ])
    );
    expect(shown().map((entry) => "body" in entry && entry.body)).toEqual([
      "Afternoon.",
      "Morning.",
    ]);
  });

  it("never replace words still waiting to be saved", () => {
    startNextThought(TODAY);
    changeThought(
      TODAY,
      openId(),
      "Mine, unsaved.",
      new Date(2026, 9, 25, 9, 0)
    );
    receiveThoughts(day([{ body: "From another app.", time: "07:00" }]));
    expect(shown()).toEqual([
      { begun: true, body: "Mine, unsaved.", time: "09:00" },
    ]);
  });

  it("keep the open thought where it is when the day is read again", () => {
    startNextThought(TODAY);
    receiveThoughts(day([{ body: "Written elsewhere.", time: "07:00" }]));
    expect(shown()[0]).toEqual({ begun: false, body: "", time: null });
  });

  it("from a file that can't be read are never written over", async () => {
    receiveThoughts({ day: TODAY as ThoughtDay["day"], state: "unreadable" });
    expect(shown()).toEqual([{ day: TODAY, kind: "unreadable" }]);
    await flushSaves();
    expect(write).not.toHaveBeenCalled();
  });
});

describe("a thought emptied and left", () => {
  it("goes from the screen and from the file", async () => {
    receiveThoughts(
      day([
        { body: "Keep.", time: "08:00" },
        { body: "Drop.", time: "09:00" },
      ])
    );
    const drop = thoughtEntries(TODAY).find(
      (entry) => entry.kind === "thought" && entry.thought.body === "Drop."
    );
    if (drop?.kind !== "thought") {
      throw new Error("Not found");
    }
    changeThought(TODAY, drop.thought.id, "", new Date());
    leaveThought(TODAY, drop.thought.id);
    await flushSaves();
    expect(shown()).toEqual([{ begun: true, body: "Keep.", time: "08:00" }]);
    expect(write).toHaveBeenLastCalledWith(TODAY, [
      { body: "Keep.", time: "08:00" },
    ]);
  });
});
