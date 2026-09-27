"use strict";

const assert = require("node:assert/strict");
const { visibleCellRange, historySnapshotLimit } = require("../web/core/editor-performance.js");

assert.deepEqual(visibleCellRange(1000, 1000, -5000, -3000, 20, 1000, 800), {
  firstRow: 150, lastRow: 190, firstCol: 250, lastCol: 300
});
assert.deepEqual(visibleCellRange(20, 10, 20, 20, 10, 100, 100), {
  firstRow: 0, lastRow: 8, firstCol: 0, lastCol: 8
});
assert.deepEqual(visibleCellRange(20, 10, -1000, -1000, 10, 100, 100), {
  firstRow: 10, lastRow: 10, firstCol: 20, lastCol: 20
});
assert.equal(historySnapshotLimit(100, 100, 1), 80);
assert.equal(historySnapshotLimit(1000, 1000, 1), 3);
assert.equal(historySnapshotLimit(500, 500, 2), 6);

console.log("editor-performance tests passed");
