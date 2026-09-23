(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelRebuildEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const VERSION = "pattern-rebuild-1";

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function gray(data, index) { return .299 * data[index] + .587 * data[index + 1] + .114 * data[index + 2]; }

  function pixelAt(data, width, height, x, y) {
    const px = clamp(x, 0, width - 1);
    const py = clamp(y, 0, height - 1);
    const x0 = Math.floor(px), y0 = Math.floor(py);
    const x1 = Math.min(width - 1, x0 + 1), y1 = Math.min(height - 1, y0 + 1);
    const tx = px - x0, ty = py - y0;
    const output = [0, 0, 0, 0];
    [[x0, y0, (1 - tx) * (1 - ty)], [x1, y0, tx * (1 - ty)], [x0, y1, (1 - tx) * ty], [x1, y1, tx * ty]].forEach(([sx, sy, weight]) => {
      const index = (sy * width + sx) * 4;
      for (let channel = 0; channel < 4; channel += 1) output[channel] += data[index + channel] * weight;
    });
    return output;
  }

  function warpQuadrilateral(image, width, height, corners, outputWidth, outputHeight) {
    const points = Array.isArray(corners) && corners.length === 4 ? corners : [{ x: 0, y: 0 }, { x: width - 1, y: 0 }, { x: width - 1, y: height - 1 }, { x: 0, y: height - 1 }];
    const outWidth = clamp(Math.round(outputWidth || width), 1, 4096);
    const outHeight = clamp(Math.round(outputHeight || height), 1, 4096);
    const output = new Uint8ClampedArray(outWidth * outHeight * 4);
    const [p0, p1, p2, p3] = points;
    const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dx3 = p0.x - p1.x + p2.x - p3.x;
    const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y, dy3 = p0.y - p1.y + p2.y - p3.y;
    const divisor = dx1 * dy2 - dx2 * dy1;
    const projectiveG = Math.abs(divisor) > 1e-8 ? (dx3 * dy2 - dx2 * dy3) / divisor : 0;
    const projectiveH = Math.abs(divisor) > 1e-8 ? (dx1 * dy3 - dx3 * dy1) / divisor : 0;
    const matrix = {
      a: p1.x - p0.x + projectiveG * p1.x,
      b: p3.x - p0.x + projectiveH * p3.x,
      c: p0.x,
      d: p1.y - p0.y + projectiveG * p1.y,
      e: p3.y - p0.y + projectiveH * p3.y,
      f: p0.y,
      g: projectiveG,
      h: projectiveH
    };
    for (let y = 0; y < outHeight; y += 1) for (let x = 0; x < outWidth; x += 1) {
      const u = outWidth === 1 ? 0 : x / (outWidth - 1);
      const v = outHeight === 1 ? 0 : y / (outHeight - 1);
      const denominator = matrix.g * u + matrix.h * v + 1;
      const sampleX = (matrix.a * u + matrix.b * v + matrix.c) / denominator;
      const sampleY = (matrix.d * u + matrix.e * v + matrix.f) / denominator;
      const sample = pixelAt(image.data, width, height, sampleX, sampleY);
      const index = (y * outWidth + x) * 4;
      for (let channel = 0; channel < 4; channel += 1) output[index + channel] = sample[channel];
    }
    return { data: output, width: outWidth, height: outHeight };
  }

  function rotateImage(image, width, height, degrees) {
    const angle = Number(degrees || 0) * Math.PI / 180;
    if (Math.abs(angle) < .0001) return { data: new Uint8ClampedArray(image.data), width, height };
    const output = new Uint8ClampedArray(width * height * 4);
    const cx = (width - 1) / 2, cy = (height - 1) / 2;
    const cos = Math.cos(-angle), sin = Math.sin(-angle);
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
      const dx = x - cx, dy = y - cy;
      const sample = pixelAt(image.data, width, height, cx + dx * cos - dy * sin, cy + dx * sin + dy * cos);
      const index = (y * width + x) * 4;
      for (let channel = 0; channel < 4; channel += 1) output[index + channel] = sample[channel];
    }
    return { data: output, width, height };
  }

  function downscale(data, width, height, outWidth, outHeight) {
    const output = new Uint8ClampedArray(outWidth * outHeight * 4);
    const stepX = width > 1 ? (width - 1) / Math.max(1, outWidth - 1) : 0;
    const stepY = height > 1 ? (height - 1) / Math.max(1, outHeight - 1) : 0;
    for (let y = 0; y < outHeight; y += 1) for (let x = 0; x < outWidth; x += 1) {
      const sample = pixelAt(data, width, height, x * stepX, y * stepY);
      const index = (y * outWidth + x) * 4;
      for (let channel = 0; channel < 4; channel += 1) output[index + channel] = sample[channel];
    }
    return { data: output, width: outWidth, height: outHeight };
  }

  function projectionSharpness(projection) {
    if (!Array.isArray(projection) || !projection.length) return 0;
    const sorted = projection.slice().sort((a, b) => b - a);
    const top = sorted.slice(0, 5).reduce((sum, value) => sum + value, 0) / Math.min(5, sorted.length);
    const mean = projection.reduce((sum, value) => sum + value, 0) / projection.length;
    return mean > 1e-6 ? top / mean : 0;
  }

  // 自动旋转估计：在小图上搜索使格线投影峰值最锐的角度，接近 0 度时不校正，避免数值噪声破坏正图。
  function estimateRotation(image, width, height, options) {
    const settings = options || {};
    const maxSide = clamp(Number(settings.maxSide || 320), 96, 1024);
    const range = clamp(Number(settings.range || 4), 0.5, 15);
    const step = clamp(Number(settings.step || 0.5), 0.1, 2);
    const scale = Math.min(1, maxSide / Math.max(width, height));
    const small = scale < 1 ? downscale(image.data, width, height, Math.max(24, Math.round(width * scale)), Math.max(24, Math.round(height * scale))) : { data: new Uint8ClampedArray(image.data), width, height };
    const scores = [];
    for (let angle = -range; angle <= range + 1e-9; angle += step) {
      const rotation = Math.round(angle * 10) / 10;
      const rotated = rotation === 0 ? small : rotateImage(small, small.width, small.height, rotation);
      const score = projectionSharpness(edgeProjection(rotated, rotated.width, rotated.height, "x")) + projectionSharpness(edgeProjection(rotated, rotated.width, rotated.height, "y"));
      if (!scores.some((item) => item.rotation === rotation)) scores.push({ rotation, score });
    }
    scores.sort((a, b) => b.score - a.score);
    const best = scores[0] || { rotation: 0, score: 0 };
    const zero = scores.find((item) => item.rotation === 0) || { rotation: 0, score: best.score };
    if (Math.abs(best.rotation) < step / 2 || best.score - zero.score < zero.score * .05) {
      return { rotation: 0, score: zero.score, confidence: 0 };
    }
    return { rotation: best.rotation, score: best.score, confidence: clamp((best.score - zero.score) / Math.max(zero.score, 1e-6) / .3, 0, 1) };
  }

  function boundaryCandidates(image, width, height) {
    const data = image.data;
    const background = [data[0], data[1], data[2]];
    let left = width, top = height, right = -1, bottom = -1;
    for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const distance = Math.hypot(data[i] - background[0], data[i + 1] - background[1], data[i + 2] - background[2]);
      if (data[i + 3] > 20 && distance > 24) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); }
    }
    const full = { id: "full", left: 0, top: 0, right: width - 1, bottom: height - 1, score: .5 };
    if (right <= left || bottom <= top) return [full];
    const content = { id: "content", left, top, right, bottom, score: .82 };
    const inset = Math.max(1, Math.round(Math.min(width, height) * .015));
    return [content, full, { id: "inset", left: inset, top: inset, right: width - 1 - inset, bottom: height - 1 - inset, score: .62 }];
  }

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
    let max = 1;
    for (const value of projection) max = Math.max(max, value);
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

  // 底板缝检测：普通格线只有一对紧邻跳变沿（间距1px），底板粗线或空隙的两个沿距离更宽。
  function detectBoardSeams(projection, period, offset, options) {
    const settings = options || {};
    if (!Array.isArray(projection) || period < 4 || projection.length < period * 8) return [];
    const minGap = clamp(Number(settings.minGap || 2), 2, Math.max(2, Math.floor(period * .9)));
    const halfWindow = Math.max(2, Math.round(period * .45));
    const lines = [];
    const count = Math.floor((projection.length - offset - 1) / period);
    for (let line = 1; line < count; line += 1) {
      const index = Math.round(offset + line * period);
      const windowStart = Math.max(0, index - halfWindow);
      const windowEnd = Math.min(projection.length - 1, index + halfWindow);
      let first = { value: -1, at: -1 }, second = { value: -1, at: -1 };
      for (let x = windowStart; x <= windowEnd; x += 1) {
        const value = projection[x];
        if (value > first.value) { second = first; first = { value, at: x }; }
        else if (value > second.value) second = { value, at: x };
      }
      if (first.at < 0 || second.at < 0) continue;
      const gap = Math.abs(first.at - second.at);
      if (gap >= minGap && first.value > .3 && second.value > .3) {
        lines.push({ line, index, gap, strength: Math.round((first.value + second.value) * 50) / 100 });
      }
    }
    const seams = lines.sort((a, b) => b.strength - a.strength).filter((item, position, all) => !all.slice(0, position).some((kept) => Math.abs(kept.line - item.line) < 20));
    return seams.sort((a, b) => a.line - b.line);
  }

  // 来源轻量分类：边缘一圈主色占比高说明是截图/扫描类清晰边框，反之为拍照。
  function estimateSourceType(image, width, height) {
    const data = image.data;
    const step = Math.max(1, Math.floor(Math.min(width, height) / 160));
    const buckets = new Map();
    let transparent = 0, total = 0;
    const visit = (x, y) => {
      const index = (y * width + x) * 4;
      if (index < 0 || index + 3 >= data.length) return;
      total += 1;
      if (data[index + 3] < 16) { transparent += 1; return; }
      const key = `${data[index] >> 4}-${data[index + 1] >> 4}-${data[index + 2] >> 4}`;
      buckets.set(key, (buckets.get(key) || 0) + 1);
    };
    for (let x = 0; x < width; x += step) { visit(x, 0); visit(x, height - 1); }
    for (let y = 0; y < height; y += step) { visit(0, y); visit(width - 1, y); }
    if (!total) return { type: "unknown", edgeUniformity: 0, hasTransparentBackground: false };
    let dominant = 0;
    buckets.forEach((value) => { dominant = Math.max(dominant, value); });
    const edgeUniformity = dominant / (total - transparent);
    const hasTransparentBackground = transparent / total > .5;
    const type = hasTransparentBackground ? "screenshot" : edgeUniformity > .68 ? "scan" : "photo";
    return { type, edgeUniformity: Math.round(edgeUniformity * 100) / 100, hasTransparentBackground };
  }

  function sampleCell(data, width, height, left, top, right, bottom) {
    const insetX = Math.max(1, Math.floor((right - left) * .22));
    const insetY = Math.max(1, Math.floor((bottom - top) * .22));
    const red = [], green = [], blue = [], values = [];
    for (let y = clamp(Math.floor(top + insetY), 0, height - 1); y < clamp(Math.ceil(bottom - insetY), 1, height); y += 1) {
      for (let x = clamp(Math.floor(left + insetX), 0, width - 1); x < clamp(Math.ceil(right - insetX), 1, width); x += 1) {
        const i = (y * width + x) * 4;
        if (data[i + 3] < 16) continue;
        red.push(data[i]); green.push(data[i + 1]); blue.push(data[i + 2]); values.push(gray(data, i));
      }
    }
    const count = values.length;
    if (!count) return { color: null, confidence: 0, reason: "transparent" };
    red.sort((a, b) => a - b); green.sort((a, b) => a - b); blue.sort((a, b) => a - b);
    const middle = Math.floor(count / 2);
    const color = { r: red[middle], g: green[middle], b: blue[middle] };
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    if (variance <= 1200) return { color, confidence: clamp(1 - Math.sqrt(variance) / 78, 0, 1), reason: "uniform" };
    // 高方差但主体亮度范围窄：属于压缩噪声或边缘混入，抑制后按均匀色处理。
    const ordered = values.slice().sort((a, b) => a - b);
    const spread = ordered[Math.min(count - 1, Math.floor(count * .9))] - ordered[Math.floor(count * .1)];
    if (spread <= 26) return { color, confidence: clamp(1 - spread / 78, .8, 1), reason: "uniform", noiseSuppressed: true };
    return { color, confidence: clamp(1 - Math.sqrt(variance) / 78, 0, 1), reason: "mixed-color" };
  }

  // 两遍聚类：先增量收集中心，再合并相近中心并重新分配，消除顺序敏感导致的同色分裂。
  function normalizeCellColors(cells, threshold) {
    const limit = Math.max(2, Number(threshold || 14));
    const collected = [];
    cells.forEach((row) => row.forEach((cell) => {
      if (!cell.color) return;
      let cluster = collected.find((item) => Math.hypot(item.r - cell.color.r, item.g - cell.color.g, item.b - cell.color.b) <= limit);
      if (!cluster) { cluster = { r: cell.color.r, g: cell.color.g, b: cell.color.b, count: 0, id: collected.length }; collected.push(cluster); }
      cluster.count += 1;
      const weight = 1 / cluster.count;
      cluster.r += (cell.color.r - cluster.r) * weight; cluster.g += (cell.color.g - cluster.g) * weight; cluster.b += (cell.color.b - cluster.b) * weight;
    }));
    const merged = [];
    collected.sort((a, b) => b.count - a.count).forEach((cluster) => {
      const near = merged.find((item) => Math.hypot(item.r - cluster.r, item.g - cluster.g, item.b - cluster.b) <= limit * .75);
      if (near) {
        const total = near.count + cluster.count;
        near.r = (near.r * near.count + cluster.r * cluster.count) / total;
        near.g = (near.g * near.count + cluster.g * cluster.count) / total;
        near.b = (near.b * near.count + cluster.b * cluster.count) / total;
        near.count = total;
      } else merged.push({ r: cluster.r, g: cluster.g, b: cluster.b, count: cluster.count, id: merged.length });
    });
    merged.sort((a, b) => b.count - a.count).forEach((cluster, index) => { cluster.id = index; });
    cells.forEach((row) => row.forEach((cell) => {
      if (!cell.color) return;
      let best = null, bestDistance = Infinity;
      merged.forEach((cluster) => {
        const distance = Math.hypot(cluster.r - cell.color.r, cluster.g - cell.color.g, cluster.b - cell.color.b);
        if (distance < bestDistance) { bestDistance = distance; best = cluster; }
      });
      if (best) { cell.clusterId = best.id; cell.color = { r: Math.round(best.r), g: Math.round(best.g), b: Math.round(best.b) }; }
    }));
    return merged.map((cluster) => ({ id: cluster.id, color: { r: Math.round(cluster.r), g: Math.round(cluster.g), b: Math.round(cluster.b) }, count: cluster.count }));
  }

  function analyze(image, width, height, options) {
    const settings = options || {};
    if (!image || !image.data || image.data.length !== width * height * 4) throw new Error("重建输入尺寸不匹配");
    const sourceType = estimateSourceType(image, width, height);
    let rotationEstimate = null;
    let rotation = Number.isFinite(Number(settings.rotation)) ? Number(settings.rotation) : 0;
    if (!Number.isFinite(Number(settings.rotation)) && settings.autoRotate !== false) {
      rotationEstimate = estimateRotation(image, width, height, settings.rotationEstimate);
      rotation = rotationEstimate.rotation;
    }
    let working = rotateImage(image, width, height, rotation);
    const candidates = boundaryCandidates(working, working.width, working.height);
    const selectedBoundary = settings.boundary || null;
    if (selectedBoundary) {
      const corners = [{ x: selectedBoundary.left, y: selectedBoundary.top }, { x: selectedBoundary.right, y: selectedBoundary.top }, { x: selectedBoundary.right, y: selectedBoundary.bottom }, { x: selectedBoundary.left, y: selectedBoundary.bottom }];
      working = warpQuadrilateral(working, working.width, working.height, corners, selectedBoundary.right - selectedBoundary.left + 1, selectedBoundary.bottom - selectedBoundary.top + 1);
    }
    if (Array.isArray(settings.corners) && settings.corners.length === 4) working = warpQuadrilateral(working, working.width, working.height, settings.corners, settings.outputWidth || working.width, settings.outputHeight || working.height);
    const processedWidth = working.width, processedHeight = working.height;
    const minPeriod = clamp(Number(settings.minPeriod || 4), 2, 64);
    const maxPeriod = clamp(Number(settings.maxPeriod || Math.min(48, Math.floor(Math.min(processedWidth, processedHeight) / 2))), minPeriod, 96);
    const projectionX = edgeProjection(working, processedWidth, processedHeight, "x");
    const projectionY = edgeProjection(working, processedWidth, processedHeight, "y");
    const xGrid = settings.cellWidth ? { period: Number(settings.cellWidth), offset: Number(settings.offsetX || 0), score: 1, candidates: [] } : detectGrid(projectionX, minPeriod, maxPeriod);
    const yGrid = settings.cellHeight ? { period: Number(settings.cellHeight), offset: Number(settings.offsetY || 0), score: 1, candidates: [] } : detectGrid(projectionY, minPeriod, maxPeriod);
    const columns = clamp(Number(settings.columns || Math.floor((processedWidth - xGrid.offset) / xGrid.period)), 1, 500);
    const rows = clamp(Number(settings.rows || Math.floor((processedHeight - yGrid.offset) / yGrid.period)), 1, 500);
    let boardSeams = { columns: [], rows: [] };
    if (settings.boardGrid && Number(settings.boardGrid.columns) > 0) {
      const specColumns = Math.max(4, Number(settings.boardGrid.columns));
      const specRows = Math.max(4, Number(settings.boardGrid.rows || specColumns));
      for (let column = specColumns; column < columns; column += specColumns) boardSeams.columns.push({ line: column, index: Math.round(xGrid.offset + column * xGrid.period), strength: 1 });
      for (let row = specRows; row < rows; row += specRows) boardSeams.rows.push({ line: row, index: Math.round(yGrid.offset + row * yGrid.period), strength: 1 });
    } else if (settings.boardSeams !== false) {
      boardSeams = { columns: detectBoardSeams(projectionX, xGrid.period, xGrid.offset), rows: detectBoardSeams(projectionY, yGrid.period, yGrid.offset) };
    }
    const cells = [];
    let confidenceSum = 0;
    for (let row = 0; row < rows; row += 1) {
      const line = [];
      for (let col = 0; col < columns; col += 1) {
        const cell = sampleCell(working.data, processedWidth, processedHeight, xGrid.offset + col * xGrid.period, yGrid.offset + row * yGrid.period, xGrid.offset + (col + 1) * xGrid.period, yGrid.offset + (row + 1) * yGrid.period);
        confidenceSum += cell.confidence;
        line.push(cell);
      }
      cells.push(line);
    }
    const clusters = normalizeCellColors(cells, settings.colorTolerance);
    const cellConfidence = rows * columns ? confidenceSum / (rows * columns) : 0;
    const gridConfidence = (xGrid.score + yGrid.score) / 2;
    const confidence = clamp(gridConfidence * .65 + cellConfidence * .35, 0, 1);
    return { version: VERSION, width, height, processedWidth, processedHeight, sourceType, calibration: { rotation, rotationEstimate, corners: settings.corners || null, boundary: selectedBoundary }, boundaryCandidates: candidates, grid: { offsetX: xGrid.offset, offsetY: yGrid.offset, cellWidth: xGrid.period, cellHeight: yGrid.period, columns, rows, confidence: gridConfidence, candidatesX: xGrid.candidates, candidatesY: yGrid.candidates, boardSeams }, cells, clusters, confidence, reasons: [gridConfidence < .45 ? "grid-low-confidence" : "grid-detected", cellConfidence < .55 ? "cell-colors-mixed" : "cell-colors-stable"], legend: settings.legend || null };
  }

  return Object.freeze({ VERSION, analyze, boundaryCandidates, detectBoardSeams, detectGrid, downscale, edgeProjection, estimateRotation, estimateSourceType, normalizeCellColors, projectionSharpness, rotateImage, sampleCell, warpQuadrilateral });
});
