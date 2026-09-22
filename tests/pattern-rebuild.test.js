"use strict";
const assert = require("node:assert/strict");
const engine = require("../web/pattern-rebuild/rebuild-engine.js");
const legend = require("../web/pattern-rebuild/legend-schema.js");

function fixture(columns, rows, cell) {
  const width = columns * cell + 1;
  const height = rows * cell + 1;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * 4;
    const line = x % cell === 0 || y % cell === 0;
    const odd = (Math.floor(x / cell) + Math.floor(y / cell)) % 2;
    data[i] = line ? 25 : odd ? 220 : 55;
    data[i + 1] = line ? 25 : odd ? 80 : 170;
    data[i + 2] = line ? 25 : odd ? 90 : 230;
    data[i + 3] = 255;
  }
  return { data, width, height };
}

const image = fixture(10, 8, 8);
const result = engine.analyze({ data: image.data }, image.width, image.height, { minPeriod: 6, maxPeriod: 10 });
assert.equal(result.version, "pattern-rebuild-1");
assert.equal(result.grid.cellWidth, 8);
assert.equal(result.grid.cellHeight, 8);
assert.equal(result.grid.columns, 10);
assert.equal(result.grid.rows, 8);
assert.equal(result.cells.length, 8);
assert.ok(result.confidence > .55);

const manual = engine.analyze({ data: image.data }, image.width, image.height, { cellWidth: 8, cellHeight: 8, columns: 10, rows: 8 });
assert.equal(manual.cells[0][0].reason, "uniform");
assert.ok(manual.cells[0][0].color);

const normalizedLegend = legend.normalize({ brand: "MARD", mappings: [{ symbol: "A", code: "A1", count: 12 }, { symbol: "?", code: "", confidence: .4, source: "ocr-candidate" }] });
assert.equal(normalizedLegend.version, 1);
assert.equal(normalizedLegend.mappings[0].source, "manual");
assert.equal(normalizedLegend.mappings[1].source, "ocr-candidate");
console.log("pattern-rebuild tests: PASS");
