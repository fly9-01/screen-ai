import { test } from "node:test";
import assert from "node:assert/strict";
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from "../src/settings.js";

function fakeStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v) };
}
const throwing = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };

test("empty storage returns defaults", () => {
  assert.deepEqual(loadSettings(fakeStorage()), DEFAULT_SETTINGS);
});
test("save then load round-trips", () => {
  const s = fakeStorage();
  saveSettings(s, { apiKey: "sk-x", mode: "detailed", watch: false });
  assert.deepEqual(loadSettings(s), { apiKey: "sk-x", mode: "detailed", watch: false });
});
test("saveSettings trims apiKey", () => {
  const s = fakeStorage();
  saveSettings(s, { apiKey: "  sk-x \n", mode: "fast", watch: false });
  assert.equal(loadSettings(s).apiKey, "sk-x");
});
test("throwing storage falls back to defaults and does not throw on save", () => {
  assert.deepEqual(loadSettings(throwing), DEFAULT_SETTINGS);
  assert.doesNotThrow(() => saveSettings(throwing, DEFAULT_SETTINGS));
});
test("corrupt JSON returns defaults", () => {
  const s = { getItem: () => "{nope", setItem() {} };
  assert.deepEqual(loadSettings(s), DEFAULT_SETTINGS);
});
