import { test } from "node:test";
import assert from "node:assert/strict";
import { createWatcher } from "../src/watcher.js";

function setup(frames) {
  let i = 0;
  let tick = null;
  let cleared = false;
  let fired = 0;
  const w = createWatcher({
    intervalMs: 1500,
    grabSmallRgba: () => frames[Math.min(i++, frames.length - 1)],
    onChange: () => { fired++; },
    setTimer: (fn) => { tick = fn; return 1; },
    clearTimer: () => { cleared = true; },
  });
  return { w, tick: () => tick(), fired: () => fired, cleared: () => cleared };
}
const A = new Uint8ClampedArray(400).fill(0);
const B = new Uint8ClampedArray(400).fill(255);

test("first tick fires onChange", () => {
  const s = setup([A]); s.w.start(); s.tick();
  assert.equal(s.fired(), 1);
});
test("unchanged frame does not fire again", () => {
  const s = setup([A, A]); s.w.start(); s.tick(); s.tick();
  assert.equal(s.fired(), 1);
});
test("changed frame fires", () => {
  const s = setup([A, B]); s.w.start(); s.tick(); s.tick();
  assert.equal(s.fired(), 2);
});
test("tick while busy is skipped and change is still detected later", () => {
  const s = setup([A, B, B]); s.w.start(); s.tick();
  s.w.setBusy(true); s.tick();
  assert.equal(s.fired(), 1);
  s.w.setBusy(false); s.tick();
  assert.equal(s.fired(), 2);
});
test("stop clears the timer", () => {
  const s = setup([A]); s.w.start(); s.w.stop();
  assert.equal(s.cleared(), true);
});
