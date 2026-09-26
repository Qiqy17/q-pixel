"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const catalog = require("../web/studio/scene-catalog.js");

const ids = catalog.groups.flatMap((group) => group.ids);
assert.equal(catalog.materials.length, 64);
assert.equal(ids.length, 12 + catalog.materials.length);
assert.equal(new Set(ids).size, ids.length);
assert.equal(new Set(catalog.materials.map((item) => item.source)).size, 64);
assert.ok(new Set(catalog.materials.map((item) => item.group)).size >= 8);
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
catalog.materials.forEach((item) => {
  const data = fs.readFileSync(path.join(__dirname, "../web", item.file));
  assert.ok(data.length > 5000 && data[0] === 0xff && data[1] === 0xd8, `invalid JPEG: ${item.id}`);
  assert.equal(require("node:crypto").createHash("sha256").update(data).digest("hex"), item.sha256);
});
console.log("scene-catalog tests: PASS");
