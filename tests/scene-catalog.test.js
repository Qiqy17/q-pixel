"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const catalog = require("../web/studio/scene-catalog.js");

const ids = catalog.groups.flatMap((group) => group.ids);
assert.equal(ids.length, 12);
assert.equal(new Set(ids).size, ids.length);
assert.deepEqual(catalog.layouts.map((item) => item.id), ["center", "desk", "info", "collage"]);
ids.forEach((id) => {
  const item = catalog.metadata[id];
  assert.ok(item && ["bitmap", "procedural"].includes(item.kind), `missing metadata: ${id}`);
  if (item.kind === "bitmap") {
    assert.equal(item.license, "CC0");
    assert.ok(item.source.startsWith("https://polyhaven.com/a/"));
    assert.ok(catalog.bitmaps[id].startsWith("./assets/"), `bitmap must work in bundled file view: ${id}`);
    assert.ok(fs.existsSync(path.join(__dirname, "../web", catalog.bitmaps[id])), `missing local texture: ${id}`);
  }
});
console.log("scene-catalog tests: PASS");
