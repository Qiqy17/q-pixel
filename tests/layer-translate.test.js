"use strict";
const assert = require("node:assert/strict");
const layer = require("../web/core/layer-translate.js");

const source = [["A", null, "B"], [null, "C", null]];
assert.deepEqual(layer.project(source, 0, 0, 3, 2), source);
assert.deepEqual(layer.project(source, 2, 0, 3, 2), [[null, null, "A"], [null, null, null]]);
assert.deepEqual(layer.project(source, -2, -1, 3, 2), [[null, null, null], [null, null, null]]);
assert.equal(layer.occupied(source), 3);
assert.deepEqual(source, [["A", null, "B"], [null, "C", null]], "投影不修改完整图层");

const movedView = layer.project(source, 2, 0, 3, 2);
const unchanged = layer.reconcile(source, 2, 0, movedView);
assert.equal(unchanged.changed, false);
assert.equal(unchanged.contentCells, source);

movedView[0][2] = "D";
const edited = layer.reconcile(source, 2, 0, movedView);
assert.equal(edited.changed, true);
assert.deepEqual(edited.contentCells, [["D", null, "B"], [null, "C", null]]);
assert.deepEqual(layer.project(edited.contentCells, 0, 0, 3, 2), [["D", null, "B"], [null, "C", null]]);

const outsideSource = layer.project([["A"]], 2, 0, 4, 1);
outsideSource[0][0] = "E";
const expanded = layer.reconcile([["A"]], 2, 0, outsideSource);
assert.equal(expanded.originCol, 0);
assert.deepEqual(expanded.contentCells, [["E", null, "A"]]);
assert.throws(() => layer.project([["A"], ["B", "C"]], 0, 0, 2, 2), TypeError);
console.log("layer-translate tests: PASS");
