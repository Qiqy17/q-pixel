"use strict";
const assert = require("node:assert/strict");
const { moveToDisplaySlot } = require("../web/core/layer-order.js");

const layers = [{ id: "back" }, { id: "middle" }, { id: "front" }];
assert.deepEqual(moveToDisplaySlot(layers, "back", 0).map((layer) => layer.id), ["middle", "front", "back"]);
assert.deepEqual(moveToDisplaySlot(layers, "front", 2).map((layer) => layer.id), ["front", "back", "middle"]);
assert.equal(moveToDisplaySlot(layers, "middle", 1), null);
assert.equal(moveToDisplaySlot(layers, "missing", 0), null);
assert.equal(moveToDisplaySlot(layers, "back", -1), null);
assert.equal(moveToDisplaySlot(layers, "back", 3), null);
assert.deepEqual(layers.map((layer) => layer.id), ["back", "middle", "front"], "排序不修改原数组");
assert.equal(moveToDisplaySlot(layers, "back", 0)[0], layers[1], "保留图层对象与画布外内容");
console.log("layer-order tests: PASS");
