"use strict";
const assert = require("node:assert/strict");
const saveAs = require("../web/core/design-save-as.js");

const source = {
  id: "original", title: "原设计", createdAt: "old", savedAt: "old",
  pattern: { width: 3, height: 2, cells: [[null, null, null], [null, null, null]] },
  layers: [
    { id: "bottom", name: "底层", visible: true, cells: [["A", "A", null], [null, null, null]] },
    { id: "top", name: "顶层", visible: false, cells: [[null, "B", null], [null, null, "C"]] }
  ],
  activeLayerId: "bottom", tileLayout: { rows: 1, cols: 2 },
  exportRegions: [{ id: "old" }], exportSettings: { regionEnabled: true },
  checkpoints: [{ id: "old" }], buildProgress: { A: 1 }
};
const merged = saveAs.createPayload(source, { title: "合并新设计" }, "merged", "new");
assert.equal(merged.title, "合并新设计");
assert.deepEqual(merged.pattern.cells, [["A", "B", null], [null, null, "C"]], "隐藏的上层也参与合并");
assert.equal(merged.layers.length, 1);
assert.equal(merged.layers[0].locked, false);
assert.equal(merged.tileLayout, null);
assert.deepEqual(merged.exportRegions, []);
assert.deepEqual(merged.checkpoints, []);
assert.deepEqual(merged.buildProgress, {});
assert.equal(source.id, "original", "另存不能改变原工程");
assert.equal(source.layers[1].visible, false);

const tiled = JSON.parse(JSON.stringify(source));
tiled.layers[1].tileRegion = { startRow: 0, startCol: 1, width: 2, height: 2 };
const separate = saveAs.createPayload(tiled, { layerId: "top", title: "顶层独立设计" }, "separate", "new");
assert.equal(separate.pattern.width, 2);
assert.equal(separate.pattern.height, 2);
assert.deepEqual(separate.pattern.cells, [["B", null], [null, "C"]]);
assert.deepEqual(separate.layers[0].cells, separate.pattern.cells);
assert.equal(separate.layers[0].visible, true);
assert.equal(separate.layers[0].tileRegion, null);
const padded = saveAs.createPayload(tiled, { layerId: "top", title: "小分区" }, "small", "new", 16);
assert.equal(padded.pattern.width, 16);
assert.equal(padded.pattern.height, 16);
assert.equal(padded.pattern.cells[0][0], "B");
assert.equal(padded.pattern.cells[15][15], null);
assert.throws(() => saveAs.createPayload(source, { layerId: "missing", title: "无效" }, "new"));
assert.throws(() => saveAs.createPayload(source, { title: " " }, "new"));
const extended = JSON.parse(JSON.stringify(source));
extended.layers[1].contentCells = [["B", null, "C", "D"]];
extended.layers[1].originCol = -1;
extended.layers[1].originRow = 1;
const extendedCopy = saveAs.createPayload(extended, { layerId: "top", title: "完整图层" }, "complete", "new");
assert.deepEqual(extendedCopy.layers[0].contentCells, [["B", null, "C", "D"]]);
assert.equal(extendedCopy.layers[0].originCol, -1);
assert.equal(extendedCopy.layers[0].originRow, 1);
assert.equal(saveAs.createPayload(extended, { title: "仅画布" }, "visible", "new").layers[0].contentCells, undefined);
console.log("design-save-as tests: PASS");
