(function (root, factory) {
  "use strict";
  const engine = root && root.QPixelImportEngine
    ? root.QPixelImportEngine
    : typeof module === "object" && module.exports
      ? require("./import-engine.js")
      : null;
  const api = Object.freeze(factory(engine));
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelImportProcessing = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (engine) {
  "use strict";

  const VERSION = "responsive-import-1";

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function srgbToLinear(value) {
    const scaled = value / 255;
    return scaled <= 0.04045 ? scaled / 12.92 : Math.pow((scaled + 0.055) / 1.055, 2.4);
  }

  function rgbToLab(r, g, b) {
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);
    const x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
    const y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750;
    const z = lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041;
    const f = (value) => value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116;
    const fx = f(x / 0.95047);
    const fy = f(y);
    const fz = f(z / 1.08883);
    return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
  }

  function createColorMatcher(palette, options) {
    if (!engine || typeof engine.deltaE2000 !== "function") throw new Error("缺少颜色匹配引擎");
    const colors = Array.isArray(palette) ? palette.filter((color) => color && color.code && color.lab) : [];
    if (!colors.length) throw new Error("色板为空");
    const config = options || {};
    const maxCache = clamp(config.maxCache || 32768, 256, 65536);
    const shift = clamp(config.quantizeShift == null ? 3 : config.quantizeShift, 2, 5);
    const cache = new Map();
    let hits = 0;
    let misses = 0;

    const nearest = (r, g, b) => {
      const key = ((r >> shift) << 16) | ((g >> shift) << 8) | (b >> shift);
      const cached = cache.get(key);
      if (cached) {
        hits += 1;
        return cached;
      }
      misses += 1;
      const lab = rgbToLab(r, g, b);
      let best = colors[0];
      let bestDistance = Infinity;
      for (let index = 0; index < colors.length; index += 1) {
        const distance = engine.deltaE2000(lab, colors[index].lab);
        if (distance < bestDistance) {
          best = colors[index];
          bestDistance = distance;
        }
      }
      if (cache.size >= maxCache) cache.delete(cache.keys().next().value);
      cache.set(key, best.code);
      return best.code;
    };

    return {
      nearest,
      stats: () => ({ size: cache.size, hits, misses, maxCache, quantizeShift: shift })
    };
  }

  function makeGrid(input, width, height) {
    if (input && input.grid && input.grid.calibrated) {
      return {
        columns: clamp(input.grid.columns, 1, 500),
        rows: clamp(input.grid.rows, 1, 500),
        offsetX: Number(input.grid.offsetX) || 0,
        offsetY: Number(input.grid.offsetY) || 0,
        cellWidth: Math.max(0.1, Number(input.grid.cellSize) || 1),
        cellHeight: Math.max(0.1, Number(input.grid.cellSize) || 1)
      };
    }
    const columns = clamp(input && input.targetWidth, 1, 500);
    const rows = clamp(input && input.targetHeight, 1, 500);
    return { columns, rows, offsetX: 0, offsetY: 0, cellWidth: width / columns, cellHeight: height / rows };
  }

  function sampleDominant(data, width, height, x, y, cellWidth, cellHeight, matcher) {
    const insetX = Math.max(0, cellWidth * 0.18);
    const insetY = Math.max(0, cellHeight * 0.18);
    const x0 = Math.max(0, Math.floor(x + insetX));
    const y0 = Math.max(0, Math.floor(y + insetY));
    const x1 = Math.min(width, Math.ceil(x + cellWidth - insetX));
    const y1 = Math.min(height, Math.ceil(y + cellHeight - insetY));
    const step = Math.max(1, Math.floor(Math.max(x1 - x0, y1 - y0) / 14));
    const counts = new Map();
    const centerX = x + cellWidth / 2;
    const centerY = y + cellHeight / 2;
    for (let sy = y0; sy < y1; sy += step) {
      for (let sx = x0; sx < x1; sx += step) {
        const offset = (sy * width + sx) * 4;
        const alpha = data[offset + 3] / 255;
        if (alpha < 0.12) continue;
        const code = matcher.nearest(data[offset], data[offset + 1], data[offset + 2]);
        const dx = Math.abs(sx - centerX) / Math.max(1, cellWidth / 2);
        const dy = Math.abs(sy - centerY) / Math.max(1, cellHeight / 2);
        const weight = alpha * (1 + Math.max(0, 1 - Math.max(dx, dy)));
        counts.set(code, (counts.get(code) || 0) + weight);
      }
    }
    let best = null;
    let score = 0;
    counts.forEach((value, code) => {
      if (value > score) {
        best = code;
        score = value;
      }
    });
    return best;
  }

  function cancelledError() {
    const error = new Error("导入已取消");
    error.name = "AbortError";
    return error;
  }

  async function maybeYield(callbacks) {
    if (callbacks && callbacks.isCancelled && callbacks.isCancelled()) throw cancelledError();
    if (callbacks && callbacks.yieldControl) await callbacks.yieldControl();
  }

  async function processTask(input, callbacks) {
    if (!engine || typeof engine.createImageProcessor !== "function") throw new Error("缺少图像处理引擎");
    const width = clamp(input && input.width, 1, 10000);
    const height = clamp(input && input.height, 1, 10000);
    const source = new Uint8ClampedArray(input && input.data);
    if (source.length < width * height * 4) throw new Error("导入像素数据不完整");
    const notify = (stage, progress) => {
      if (callbacks && callbacks.onProgress) callbacks.onProgress({ stage, progress: clamp(progress, 0, 100) });
    };
    notify("adjust", 4);
    const processor = engine.createImageProcessor(source, width, height, input.settings || {});
    const adjustChunk = callbacks && callbacks.yieldControl ? 24 : height;
    for (let row = 0; row < height; row += adjustChunk) {
      processor.processRows(row, Math.min(height, row + adjustChunk));
      notify("adjust", 5 + Math.round(Math.min(height, row + adjustChunk) / height * 43));
      await maybeYield(callbacks);
    }
    const processed = processor.finish();
    notify("match", 50);
    const matcher = createColorMatcher(input.palette, input.matcherOptions);
    const grid = makeGrid(input, processed.width, processed.height);
    const cells = [];
    const matchChunk = callbacks && callbacks.yieldControl ? 2 : grid.rows;
    for (let row = 0; row < grid.rows; row += 1) {
      const line = [];
      for (let col = 0; col < grid.columns; col += 1) {
        line.push(sampleDominant(
          processed.data,
          processed.width,
          processed.height,
          grid.offsetX + col * grid.cellWidth,
          grid.offsetY + row * grid.cellHeight,
          grid.cellWidth,
          grid.cellHeight,
          matcher
        ));
      }
      cells.push(line);
      if ((row + 1) % matchChunk === 0 || row + 1 === grid.rows) {
        notify("match", 50 + Math.round((row + 1) / grid.rows * 46));
        await maybeYield(callbacks);
      }
    }
    notify("complete", 100);
    return {
      version: VERSION,
      width: grid.columns,
      height: grid.rows,
      cells,
      processedWidth: processed.width,
      processedHeight: processed.height,
      processedData: processed.data,
      removedRatio: processed.removedRatio,
      backgroundRejected: processed.backgroundRejected,
      matcher: matcher.stats()
    };
  }

  return { VERSION, rgbToLab, createColorMatcher, processTask };
});
