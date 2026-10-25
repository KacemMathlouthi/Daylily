import { describe, expect, it } from "vitest";
import type { UpdateState } from "../shared/channels";
import { nextUpdateState, type UpdateContext } from "./update-state";

const SELF: UpdateContext = { dismissedVersion: null, download: null };
const MAC: UpdateContext = { dismissedVersion: null, download: "mac" };
const IDLE: UpdateState = { status: "idle" };

describe("nextUpdateState", () => {
  it("says the version is the latest when nothing newer is found", () => {
    const checking = nextUpdateState(IDLE, { type: "checking" }, SELF);
    expect(checking).toEqual({ status: "checking" });
    expect(
      nextUpdateState(
        checking,
        { at: "2026-10-25T09:00:00Z", type: "none" },
        SELF
      )
    ).toEqual({ checkedAt: "2026-10-25T09:00:00Z", status: "latest" });
  });

  it("downloads a new version where the app replaces itself, then has it ready", () => {
    let state = nextUpdateState(
      IDLE,
      { type: "found", version: "0.2.0" },
      SELF
    );
    expect(state).toEqual({
      percent: 0,
      status: "downloading",
      version: "0.2.0",
    });
    state = nextUpdateState(state, { percent: 41.6, type: "progress" }, SELF);
    expect(state).toEqual({
      percent: 42,
      status: "downloading",
      version: "0.2.0",
    });
    state = nextUpdateState(
      state,
      { type: "downloaded", version: "0.2.0" },
      SELF
    );
    expect(state).toEqual({
      dismissed: false,
      status: "ready",
      version: "0.2.0",
    });
  });

  it("points to the download where the app can't replace itself", () => {
    expect(
      nextUpdateState(IDLE, { type: "found", version: "0.2.0" }, MAC)
    ).toEqual({
      dismissed: false,
      download: "mac",
      status: "available",
      version: "0.2.0",
    });
  });

  it("keeps a downloaded version ready through later looks and failures", () => {
    const ready: UpdateState = {
      dismissed: false,
      status: "ready",
      version: "0.2.0",
    };
    expect(nextUpdateState(ready, { type: "checking" }, SELF)).toBe(ready);
    expect(nextUpdateState(ready, { at: "x", type: "none" }, SELF)).toBe(ready);
    expect(
      nextUpdateState(ready, { offline: false, type: "failed" }, SELF)
    ).toBe(ready);
    expect(
      nextUpdateState(ready, { type: "found", version: "0.2.0" }, SELF)
    ).toBe(ready);
  });

  it("keeps a version that's out through later looks and failures", () => {
    const out: UpdateState = {
      dismissed: false,
      download: "mac",
      status: "available",
      version: "0.2.0",
    };
    expect(nextUpdateState(out, { type: "checking" }, MAC)).toBe(out);
    expect(nextUpdateState(out, { offline: false, type: "failed" }, MAC)).toBe(
      out
    );
  });

  it("shows a failed look as an error otherwise", () => {
    const checking: UpdateState = { status: "checking" };
    expect(
      nextUpdateState(checking, { offline: true, type: "failed" }, SELF)
    ).toEqual({ offline: true, status: "error" });
  });

  it("remembers that a version's card was put away, until a newer one comes", () => {
    const putAway: UpdateContext = {
      dismissedVersion: "0.2.0",
      download: "mac",
    };
    expect(
      nextUpdateState(IDLE, { type: "found", version: "0.2.0" }, putAway)
    ).toMatchObject({ dismissed: true });
    expect(
      nextUpdateState(IDLE, { type: "found", version: "0.3.0" }, putAway)
    ).toMatchObject({ dismissed: false });
  });

  it("puts away the card for a ready version", () => {
    const ready: UpdateState = {
      dismissed: false,
      status: "ready",
      version: "0.2.0",
    };
    expect(nextUpdateState(ready, { type: "dismissed" }, SELF)).toEqual({
      ...ready,
      dismissed: true,
    });
    expect(nextUpdateState(IDLE, { type: "dismissed" }, SELF)).toBe(IDLE);
  });
});
