import assert from "node:assert/strict";
import { test } from "node:test";
import { createPlaybackClock } from "../ui/playbackClock.ts";

test("pausing freezes at the displayed position instead of the last poll", () => {
  let now = 0;
  const clock = createPlaybackClock(30, 200, true, () => now);
  now = 3250;
  assert.equal(clock.position(), 33.25);
  assert.equal(clock.setPlaying(false), 33.25);
  now = 15000;
  assert.equal(clock.position(), 33.25);
});

test("resuming advances immediately from the frozen position", () => {
  let now = 0;
  const clock = createPlaybackClock(30, 200, false, () => now);
  now = 10000;
  assert.equal(clock.setPlaying(true), 30);
  now = 10500;
  assert.equal(clock.position(), 30.5);
});

test("rapid play/pause cycles preserve elapsed time between polls", () => {
  let now = 0;
  const clock = createPlaybackClock(30, 200, true, () => now);
  now = 1250;
  clock.setPlaying(false);
  now = 2500;
  clock.setPlaying(true);
  now = 3000;
  clock.setPlaying(false);
  now = 10000;
  assert.equal(clock.position(), 31.75);
});

test("speaker updates reconcile elapsed time without changing play state", () => {
  let now = 0;
  const clock = createPlaybackClock(30, 200, true, () => now);
  now = 3000;
  clock.setPlaying(false);
  assert.equal(clock.sync(32, 200), 32);
  now = 10000;
  assert.equal(clock.position(), 32);
  clock.setPlaying(true);
  now = 12000;
  assert.equal(clock.position(), 34);
  assert.equal(clock.sync(33, 200), 33);
  now = 13000;
  assert.equal(clock.position(), 34);
});

test("track and room changes reset the clock and respect the new duration", () => {
  let now = 0;
  const clock = createPlaybackClock(190, 200, true, () => now);
  now = 20000;
  assert.equal(clock.position(), 200);
  assert.equal(clock.sync(0, 60), 0);
  now = 22000;
  assert.equal(clock.position(), 2);
  assert.equal(clock.sync(-1, 60), 0);
});
