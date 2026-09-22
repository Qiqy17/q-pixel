(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelRebuildEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const VERSION = "pattern-rebuild-1";

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function gray(data, index) { return .299 * data[index] + .587 * data[index + 1] + .114 * data[index + 2]; }

  function edgeProjection(image, width, height, axis) {
    const data = image.data || image;
    const length = axis === "x" ? width : height;
    const projection = new Array(length).fill(0);
    if (axis === "x") {
      for (let x = 1; x < width; x += 1) for (let y = 0; y < height; y += 1) {
        const i = (y * width + x) * 4;
        projection[x] += Math.abs(gray(data, i) - gray(data, i - 4));
      }
    } else {
      for (let y = 1; y < height; y += 1) for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 4;
        projection[y] += Math.abs(gray(data, i) - gray(data, i - width * 4));
      }
    }
    const max = Math.max(1, ...projection);
    return projection.map((value) => value / max);
  }

  function scorePeriod(projection, period) {
    let score = 0;
    let samples = 0;
    for (let offset = 0; offset < period; offset += 1) {
      let sum = 0;
      let count = 0;
      for (let i = offset; i < projection.length; i += period) { sum += projection[i]; count += 1; }
      if (count > 1) { score = Math.max(score, sum / count); samples += 1; }
    }
    return samples ? score : 0;
  }

  function detectGrid(projection, minPeriod, maxPeriod) {
    const candidates = [];
    for (let period = minPeriod; period <= maxPeriod; period += 1) candidates.push({ period, score: scorePeriod(projection, period) });
    candidates.sort((a, b) => b.score - a.score || a.period - b.period);
    const best = candidates[0] || { period: minPeriod, score: 0 };
    let bestOffset = 0;
    let bestOffsetScore = -1;
    for (let offset = 0; offset < best.period; offset += 1) {
      let sum = 0;
      let count = 0;
      for (let i = offset; i < projection.length; i += best.period) { sum += projection[i]; count += 1; }
      if (count && sum / count > bestOffsetScore) { bestOffsetScore = sum / count; bestOffset = offset; }
    }
    return { period: best.period, offset: bestOffset, score: clamp(best.score, 0, 1), candidates: candidates.slice(0, 5) };
  }

  function sampleCell(data, width, height, left, top, right, bottom) {
    const insetX = Math.max(1, Math.floor((right - left) * .22));
    const insetY = Math.max(1, Math.floor((bottom - top) * .22));
    let r = 0, g = 0, b = 0, count = 0, variance = 0;
    const values = [];
    for (let y = clamp(Math.floor(top + insetY), 0, height - 1); y < clamp(Math.ceil(bottom - insetY), 1, height); y += 1) {
      for (let x = clamp(Math.floor(left + insetX), 0, width - 1); x < clamp(Math.ceil(right - insetX), 1, width); x += 1) {
        const i = (y * width + x) * 4;
        if (data[i + 3] < 16) continue;
        r += data[i]; g += data[i + 1]; b += data[i + 2]; count += 1; values.push(gray(data, i));
      }
    }
    if (!count) return { color: null, confidence: 0, reason: "transparent" };
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    return { color: { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) }, confidence: clamp(1 - Math.sqrt(variance) / 90, 0, 1), reason: variance > 1600 ? "mixed-color" : "uniform" };
  }

  function analyze(image, width, height, options) {
    const settings = options || {};
    if (!image || !image.data || image.data.length !== width * height * 4) throw new Error("重建输入尺寸不匹配");
    const minPeriod = clamp(Number(settings.minPeriod || 4), 2, 64);
    const maxPeriod = clamp(Number(settings.maxPeriod || Math.min(48, Math.floor(Math.min(width, height) / 2))), minPeriod, 96);
    const xGrid = settings.cellWidth ? { period: Number(settings.cellWidth), offset: Number(settings.offsetX || 0), score: 1, candidates: [] } : detectGrid(edgeProjection(image, width, height, "x"), minPeriod, maxPeriod);
    const yGrid = settings.cellHeight ? { period: Number(settings.cellHeight), offset: Number(settings.offsetY || 0), score: 1, candidates: [] } : detectGrid(edgeProjection(image, width, height, "y"), minPeriod, maxPeriod);
    const columns = clamp(Number(settings.columns || Math.floor((width - xGrid.offset) / xGrid.period)), 1, 500);
    const rows = clamp(Number(settings.rows || Math.floor((height - yGrid.offset) / yGrid.period)), 1, 500);
    const cells = [];
    let confidenceSum = 0;
    for (let row = 0; row < rows; row += 1) {
      const line = [];
      for (let col = 0; col < columns; col += 1) {
        const cell = sampleCell(image.data, width, height, xGrid.offset + col * xGrid.period, yGrid.offset + row * yGrid.period, xGrid.offset + (col + 1) * xGrid.period, yGrid.offset + (row + 1) * yGrid.period);
        confidenceSum += cell.confidence;
        line.push(cell);
      }
      cells.push(line);
    }
    const cellConfidence = rows * columns ? confidenceSum / (rows * columns) : 0;
    const gridConfidence = (xGrid.score + yGrid.score) / 2;
    const confidence = clamp(gridConfidence * .65 + cellConfidence * .35, 0, 1);
    return { version: VERSION, width, height, grid: { offsetX: xGrid.offset, offsetY: yGrid.offset, cellWidth: xGrid.period, cellHeight: yGrid.period, columns, rows, confidence: gridConfidence, candidatesX: xGrid.candidates, candidatesY: yGrid.candidates }, cells, confidence, reasons: [gridConfidence < .45 ? "grid-low-confidence" : "grid-detected", cellConfidence < .55 ? "cell-colors-mixed" : "cell-colors-stable"], legend: settings.legend || null };
  }

  return Object.freeze({ VERSION, analyze, detectGrid, edgeProjection, sampleCell });
});
