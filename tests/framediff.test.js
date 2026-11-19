import { test } from "node:test";
import assert from "node:assert/strict";
import { frameChanged } from "../src/framediff.js";

const N = 100; // pixels
const frame = (v = 0) => new Uint8ClampedArray(N * 4).fill(v);
const withChanged = (count) => {
  const f = frame(0);
  for (let p = 0; p < count; p++) { f[p * 4] = 255; }
  return f;
};

test("null prev counts as changed", () => assert.equal(frameChanged(null, frame()), true));
test("identical frames are unchanged", () => assert.equal(frameChanged(frame(), frame()), false));
test("5% of pixels differing is changed", () => assert.equal(frameChanged(frame(), withChanged(5)), true));
test("1% of pixels differing is unchanged", () => assert.equal(frameChanged(frame(), withChanged(1)), false));
test("different lengths count as changed", () =>
  assert.equal(frameChanged(new Uint8ClampedArray(8), new Uint8ClampedArray(16)), true));
