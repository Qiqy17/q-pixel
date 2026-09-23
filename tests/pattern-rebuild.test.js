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

// 倾斜扫描：拍照图纸自带 2.4 度倾斜，自动旋转估计应恢复网格。
const skewed = engine.rotateImage({ data: image.data }, image.width, image.height, 2.4);
const rotationEstimate = engine.estimateRotation({ data: skewed.data }, skewed.width, skewed.height);
assert.ok(Math.abs(rotationEstimate.rotation + 2.4) <= .8, `expected ≈ -2.4, got ${rotationEstimate.rotation}`);
const autoRotated = engine.analyze({ data: skewed.data }, skewed.width, skewed.height, { autoRotate: true, minPeriod: 6, maxPeriod: 10 });
assert.equal(autoRotated.calibration.rotation, rotationEstimate.rotation);
assert.ok(autoRotated.grid.cellWidth === 8 || autoRotated.grid.cellWidth === 9);
assert.equal(autoRotated.grid.columns, 10);

// 平直图纸：自动旋转必须吸附回 0，避免破坏正图。
assert.equal(engine.estimateRotation({ data: image.data }, image.width, image.height).rotation, 0);
assert.equal(engine.analyze({ data: image.data }, image.width, image.height, { minPeriod: 6, maxPeriod: 10 }).grid.cellWidth, 8);

// 压缩噪声：8×8 块与格线错位产生块状偏色，叠加少量压缩振铃离群像素拉高方差。
const blocky = new Uint8ClampedArray(image.data);
for (let by = 4; by < image.height; by += 8) for (let bx = 4; bx < image.width; bx += 8) {
  const offset = ((bx * 3 + by * 7) % 11) - 5;
  for (let y = by; y < Math.min(by + 8, image.height); y += 1) for (let x = bx; x < Math.min(bx + 8, image.width); x += 1) {
    if (x % 8 === 0 || y % 8 === 0) continue;
    const i = (y * image.width + x) * 4;
    blocky[i] += offset; blocky[i + 1] += offset; blocky[i + 2] += offset;
  }
}
for (let row = 0; row < 8; row += 1) for (let col = 0; col < 10; col += 1) {
  [[1, 2], [4, 5], [6, 3]].forEach(([dx, dy]) => {
    const x = col * 8 + dx, y = row * 8 + dy;
    if (x >= image.width || y >= image.height || x % 8 === 0 || y % 8 === 0) return;
    const i = (y * image.width + x) * 4;
    blocky[i] += 180; blocky[i + 1] += 180; blocky[i + 2] += 180;
  });
}
const compressed = engine.analyze({ data: blocky }, image.width, image.height, { cellWidth: 8, cellHeight: 8, columns: 10, rows: 8, colorTolerance: 14 });
assert.ok(compressed.confidence > .8, `compression confidence ${compressed.confidence}`);
assert.ok(compressed.clusters.length <= 2, `compression clusters ${compressed.clusters.length}`);
assert.ok(compressed.cells.flat().every((cell) => cell.reason === "uniform"));
assert.ok(compressed.cells.flat().some((cell) => cell.noiseSuppressed));

// 透明背景图纸：背景 alpha 为 0，来源分类应识别截图，采样不受影响。
const transparentPattern = fixture(6, 5, 10);
for (let y = 0; y < transparentPattern.height; y += 1) for (let x = 0; x < transparentPattern.width; x += 1) {
  const i = (y * transparentPattern.width + x) * 4;
  if (x < 10 || y < 10 || x >= transparentPattern.width - 10 || y >= transparentPattern.height - 10) transparentPattern.data[i + 3] = 0;
}
const transparentResult = engine.analyze({ data: transparentPattern.data }, transparentPattern.width, transparentPattern.height, { minPeriod: 8, maxPeriod: 12 });
assert.equal(transparentResult.sourceType.type, "screenshot");
assert.equal(transparentResult.grid.cellWidth, 10);
assert.ok(transparentResult.cells.flat().some((cell) => cell.reason === "transparent"));

// 底板缝：第 5 列格线加粗为 3px 深色，应被识别为底板边界。
const boarded = new Uint8ClampedArray(image.data);
for (let y = 0; y < image.height; y += 1) for (let w = -1; w <= 1; w += 1) {
  const x = 40 + w;
  if (x < 0 || x >= image.width) continue;
  const i = (y * image.width + x) * 4;
  boarded[i] = 10; boarded[i + 1] = 10; boarded[i + 2] = 10;
}
const boardedResult = engine.analyze({ data: boarded }, image.width, image.height, { minPeriod: 6, maxPeriod: 10 });
assert.equal(boardedResult.grid.boardSeams.columns.length, 1);
assert.equal(boardedResult.grid.boardSeams.columns[0].line, 5);
assert.equal(engine.detectBoardSeams(engine.edgeProjection({ data: image.data }, image.width, image.height, "x"), 8, 0).length, 0);

// 手动底板规格：按 29×29 强制分割时输出规则缝线。
const specResult = engine.analyze({ data: image.data }, image.width, image.height, { cellWidth: 8, cellHeight: 8, columns: 10, rows: 8, boardGrid: { columns: 5, rows: 4 } });
assert.deepEqual(specResult.grid.boardSeams.columns.map((seam) => seam.line), [5]);
assert.deepEqual(specResult.grid.boardSeams.rows.map((seam) => seam.line), [4]);
assert.deepEqual(engine.analyze({ data: image.data }, image.width, image.height, { cellWidth: 8, cellHeight: 8, columns: 10, rows: 8, boardSeams: false }).grid.boardSeams, { columns: [], rows: [] });

// 两遍聚类：同一颜色以不同顺序出现时应归并为一个簇。
const orderedColors = [];
for (let index = 0; index < 24; index += 1) orderedColors.push({ color: { r: 120 + (index % 3), g: 66 + (index % 2), b: 200 }, confidence: .9, reason: "uniform" });
const orderedCells = [orderedColors.slice()];
const singleCluster = engine.normalizeCellColors(orderedCells, 14);
assert.equal(singleCluster.length, 1);
assert.equal(orderedCells[0][0].color.r, orderedCells[0][23].color.r);
console.log("pattern-rebuild tests: PASS");
