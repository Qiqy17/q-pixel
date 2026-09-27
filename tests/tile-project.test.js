"use strict";
const assert = require("node:assert/strict");
const tiles = require("../web/studio/tile-project.js");
const cells = Array.from({ length: 5 }, (_, row) => Array.from({ length: 7 }, (_, col) => `${row}-${col}`));
const split = tiles.divide({ width: 7, height: 5, cells }, 3, 3);
assert.equal(split.regions.length, 9);
const reconstructed = Array.from({ length: 5 }, () => Array(7).fill(null));
split.layers.forEach(({ region, cells: layerCells }) => {
  let count = 0;
  layerCells.forEach((line, row) => line.forEach((code, col) => {
    if (!code) return;
    assert(tiles.contains(region, row, col));
    assert.equal(reconstructed[row][col], null, "分区不得重叠");
    reconstructed[row][col] = code;
    count++;
  }));
  assert.equal(count, region.width * region.height);
  assert.equal(Object.keys(tiles.usage(layerCells, region)).length, count);
});
assert.deepEqual(reconstructed, cells, "非整除尺寸不得丢像素");
assert(tiles.validLayout({ width: 7, height: 5, cells }, split, split.layers.map(({ region, cells }) => ({ tileRegion: region, cells }))));
const corrupted = split.layers.map(({ region, cells }) => ({ tileRegion: region, cells: cells.map((row) => row.slice()) }));
corrupted[0].cells[4][6] = "wrong";
assert.equal(tiles.validLayout({ width: 7, height: 5, cells }, split, corrupted), false);
assert.throws(() => tiles.divide({ width: 7, height: 5, cells }, 5, 5));
console.log("tile-project tests: PASS");
