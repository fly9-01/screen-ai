import { test } from "node:test";
import assert from "node:assert/strict";
import { chooseEngine } from "../src/engine.js";

test("empty key chooses local", () => assert.equal(chooseEngine({ apiKey: "" }), "local"));
test("whitespace-only key chooses local", () => assert.equal(chooseEngine({ apiKey: "   \n" }), "local"));
test("real key chooses claude", () => assert.equal(chooseEngine({ apiKey: "sk-ant-1" }), "claude"));
