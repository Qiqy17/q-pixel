"use strict";
const assert = require("node:assert/strict");
const { translate } = require("../web/core/layer-translate.js");

const source = [["A", null, "B"], [null, "C", null]];
const cases = [
  { dx: 1, dy: 0, cells: [[null, "A", null], [null, null, "C"]], clipped: 1 },
  { dx: -1, dy: 0, cells: [[null, "B", null], ["C", null, null]], clipped: 1 },
  { dx: 0, dy: 1, cells: [[null, null, null], ["A", null, "B"]], clipped: 1 },
  { dx: 0, dy: -1, cells: [[null, "C", null], [null, null, null]], clipped: 2 }
];
for (const item of cases) {
  const result = translate(source, 3, 2, item.dx, item.dy);
  assert.deepEqual(result.cells, item.cells);
  assert.equal(result.clipped, item.clipped);
  assert.equal(result.moved + result.clipped, 3);
}
assert.deepEqual(source, [["A", null, "B"], [null, "C", null]], "移动不修改原图层");
assert.deepEqual(translate(source, 3, 2, 3, 0).cells, [[null, null, null], [null, null, null]]);
assert.equal(translate(source, 3, 2, 3, 0).clipped, 3);
assert.equal(translate([[null]], 1, 1, 1, 0).moved, 0);
assert.throws(() => translate(source, 3, 2, 0.5, 0), TypeError);
console.log("layer-translate tests: PASS");
