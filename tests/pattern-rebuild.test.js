"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const engine = require("../web/pattern-rebuild/rebuild-engine.js");
const legend = require("../web/pattern-rebuild/legend-schema.js");
const workbench = require("../web/pattern-rebuild/rebuild-workbench.js");

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
assert.ok(manual.clusters.length <= 2);

const noisyData = new Uint8ClampedArray(image.data);
for (let y = 1; y < image.height - 1; y += 1) for (let x = 1; x < image.width - 1; x += 1) {
  if (x % 8 === 0 || y % 8 === 0) continue;
  const i = (y * image.width + x) * 4;
  const noise = ((x * 13 + y * 7) % 9) - 4;
  noisyData[i] += noise;
  noisyData[i + 1] -= noise;
}
const noisy = engine.analyze({ data: noisyData }, image.width, image.height, { cellWidth: 8, cellHeight: 8, columns: 10, rows: 8, colorTolerance: 14 });
assert.ok(noisy.confidence > .85);
assert.ok(noisy.clusters.length <= 2);

const missingLine = new Uint8ClampedArray(image.data);
for (let y = 0; y < image.height; y += 1) {
  const i = (y * image.width + 16) * 4;
  missingLine[i] = 55; missingLine[i + 1] = 170; missingLine[i + 2] = 230;
}
const recovered = engine.analyze({ data: missingLine }, image.width, image.height, { minPeriod: 6, maxPeriod: 10 });
assert.equal(recovered.grid.cellWidth, 8);

const rotated = engine.rotateImage({ data: image.data }, image.width, image.height, 2);
const corrected = engine.analyze({ data: rotated.data }, rotated.width, rotated.height, { rotation: -2, cellWidth: 8, cellHeight: 8, columns: 10, rows: 8 });
assert.ok(corrected.confidence > .75);

const corners = [{ x: 2, y: 1 }, { x: image.width - 3, y: 4 }, { x: image.width - 1, y: image.height - 2 }, { x: 0, y: image.height - 4 }];
const perspective = engine.warpQuadrilateral({ data: image.data }, image.width, image.height, corners, image.width, image.height);
assert.equal(perspective.data.length, image.data.length);
assert.notDeepEqual(Array.from(perspective.data.slice(0, 12)), Array.from(image.data.slice(0, 12)));

const boundaries = engine.boundaryCandidates({ data: image.data }, image.width, image.height);
assert.ok(boundaries.some((candidate) => candidate.id === "full"));
assert.ok(boundaries.length >= 2);

const transparent = new Uint8ClampedArray(4 * 4 * 4);
assert.equal(engine.sampleCell(transparent, 4, 4, 0, 0, 4, 4).reason, "transparent");

const normalizedLegend = legend.normalize({ brand: "MARD", mappings: [{ symbol: "A", code: "A1", count: 12 }, { symbol: "?", code: "", confidence: .4, source: "ocr-candidate" }] });
assert.equal(normalizedLegend.version, 1);
assert.equal(normalizedLegend.mappings[0].source, "manual");
assert.equal(normalizedLegend.mappings[1].source, "ocr-candidate");
assert.equal(typeof workbench.create, "function");
const workerSource = fs.readFileSync(path.join(__dirname, "../web/pattern-rebuild/rebuild-worker.js"), "utf8");
assert.match(workerSource, /message\.type === "cancel"/);
assert.match(workerSource, /type: "result"/);
console.log("pattern-rebuild tests: PASS");
