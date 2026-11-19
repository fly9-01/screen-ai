import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRequest, parseAnswer, askClaude, PROMPT } from "../src/claude.js";

const ok = (body) => async () => ({ ok: true, status: 200, json: async () => body });
const status = (s) => async () => ({ ok: false, status: s, json: async () => ({ error: { message: "x" } }) });

test("headers are exact", () => {
  const { url, init } = buildRequest("sk-1", "fast", "AAA");
  assert.equal(url, "https://api.anthropic.com/v1/messages");
  assert.equal(init.method, "POST");
  assert.deepEqual(init.headers, {
    "x-api-key": "sk-1",
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true",
    "content-type": "application/json",
  });
});
test("fast uses haiku, detailed uses sonnet", () => {
  assert.equal(JSON.parse(buildRequest("k", "fast", "A").init.body).model, "claude-haiku-5-5");
  assert.equal(JSON.parse(buildRequest("k", "detailed", "A").init.body).model, "claude-sonnet-5-5");
});
test("body has image block before text block", () => {
  const c = JSON.parse(buildRequest("k", "fast", "AAA").init.body).messages[0].content;
  assert.equal(c[0].type, "image");
  assert.deepEqual(c[0].source, { type: "base64", media_type: "image/jpeg", data: "AAA" });
  assert.deepEqual(c[1], { type: "text", text: PROMPT });
});
test("parseAnswer joins text blocks", () => {
  assert.equal(parseAnswer({ content: [{ type: "text", text: "a" }, { type: "text", text: "b" }] }), "a\nb");
});
test("parseAnswer throws API error message", () => {
  assert.throws(() => parseAnswer({ error: { message: "boom" } }), /boom/);
});
test("401 maps to Invalid API key", async () => {
  await assert.rejects(askClaude("k", "fast", "A", status(401)), /Invalid API key/);
});
test("429 maps to rate limit message", async () => {
  await assert.rejects(askClaude("k", "fast", "A", status(429)), /Rate limited, try again/);
});
test("network failure mentions network", async () => {
  await assert.rejects(askClaude("k", "fast", "A", async () => { throw new TypeError("fail"); }), /network/i);
});
test("success returns answer text", async () => {
  assert.equal(await askClaude("k", "fast", "A", ok({ content: [{ type: "text", text: "42" }] })), "42");
});
