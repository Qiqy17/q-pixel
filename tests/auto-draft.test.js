"use strict";

const assert = require("node:assert/strict");
const draft = require("../web/core/auto-draft.js");

assert.deepEqual(draft.INTERVALS, [0, 15000, 30000, 60000, 180000, 300000]);
assert.equal(draft.normalizeInterval(null), 180000);
assert.equal(draft.normalizeInterval("15000"), 15000);
assert.equal(draft.normalizeInterval("60000"), 60000);
assert.equal(draft.normalizeInterval("oops"), 180000);

const values = new Map();
const storage = {
  getItem: (key) => values.get(key) || null,
  removeItem: (key) => values.delete(key)
};
const legacyStore = {
  mainKey: "draft-main",
  journalKey: "draft-journal",
  writePayload: (payload) => values.set("draft-main", payload),
  recover: () => {},
  readPayload: () => ({ payload: values.get("draft-main") || null })
};
const vault = draft.createVault({ storage, legacyStore });
const first = { savedAt: "2026-09-24T12:00:00Z", pattern: { cells: [["A1"]] } };

(async () => {
  assert.equal(await vault.save(first), "localstorage");
  assert.deepEqual(await vault.load(), first);
  await vault.clear();
  assert.equal(await vault.load(), null);
  await assert.rejects(() => vault.save(null), /草稿内容为空/);
  console.log("auto-draft tests: PASS");
})().catch((error) => { console.error(error); process.exitCode = 1; });
