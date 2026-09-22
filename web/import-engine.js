(function (root, factory) {
  "use strict";
  const api = Object.freeze(factory());
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelImportEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const VERSION = "adaptive-import-1";
  const TYPES = ["pixelArt", "illustration", "photo"];
  const TYPE_LABELS = Object.freeze({
    pixelArt: "像素画",
    illustration: "插画 / AI 图",
    photo: "照片"
  });

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function colorDistance(r1, g1, b1, r2, g2, b2) {
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return Math.sqrt(dr * dr * 0.25 + dg * dg * 0.55 + db * db * 0.2);
  }

  function defaultSettings(type) {
    const safeType = TYPES.includes(type) ? type : "illustration";
    const shared = {
      type: safeType,
      exposure: 0,
      contrast: 100,
      saturation: 100,
      removeBackground: false,
      backgroundTolerance: 24,
      dither: "off",
      denoise: 0
    };
    if (safeType === "pixelArt") {
      return Object.assign(shared, { contrast: 100, saturation: 100, dither: "off", denoise: 0 });
    }
    if (safeType === "photo") {
      return Object.assign(shared, { contrast: 106, saturation: 102, dither: "auto", denoise: 18 });
    }
    return Object.assign(shared, { contrast: 103, saturation: 104, dither: "off", denoise: 6 });
  }

  function quantizedKey(r, g, b) {
    return `${r >> 4}:${g >> 4}:${b >> 4}`;
  }

  function collectRunLengths(data, width, height) {
    const runs = [];
    const scanRows = [0.18, 0.34, 0.5, 0.66, 0.82].map((ratio) => Math.min(height - 1, Math.max(0, Math.round(height * ratio))));
    const scanCols = [0.18, 0.34, 0.5, 0.66, 0.82].map((ratio) => Math.min(width - 1, Math.max(0, Math.round(width * ratio))));
    const scan = (length, pixelAt) => {
      let start = 0;
      let previous = pixelAt(0);
      for (let index = 1; index <= length; index += 1) {
        const current = index < length ? pixelAt(index) : null;
        if (current && colorDistance(previous[0], previous[1], previous[2], current[0], current[1], current[2]) < 4) continue;
        const size = index - start;
        if (size >= 2 && size <= 64) runs.push(size);
        start = index;
        previous = current;
      }
    };
    scanRows.forEach((row) => scan(width, (col) => {
      const offset = (row * width + col) * 4;
      return [data[offset], data[offset + 1], data[offset + 2]];
    }));
    scanCols.forEach((col) => scan(height, (row) => {
      const offset = (row * width + col) * 4;
      return [data[offset], data[offset + 1], data[offset + 2]];
    }));
    if (runs.length < 8) return 0;
    const counts = new Map();
    runs.forEach((run) => counts.set(run, (counts.get(run) || 0) + 1));
    let best = 0;
    counts.forEach((count) => { best = Math.max(best, count); });
    return clamp(best / runs.length * 3.2, 0, 1);
  }

  function analyzeImageData(data, width, height) {
    if (!data || !width || !height || data.length < width * height * 4) {
      throw new Error("图像分析数据无效");
    }
    const pixelCount = width * height;
    const targetSamples = 24000;
    const step = Math.max(1, Math.floor(Math.sqrt(pixelCount / targetSamples)));
    const colors = new Set();
    let samples = 0;
    let transparent = 0;
    let flat = 0;
    let strong = 0;
    let gradient = 0;
    let chromaSum = 0;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const offset = (y * width + x) * 4;
        const alpha = data[offset + 3];
        samples += 1;
        if (alpha < 24) {
          transparent += 1;
          continue;
        }
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        colors.add(quantizedKey(r, g, b));
        chromaSum += Math.max(r, g, b) - Math.min(r, g, b);
        if (x + step < width) {
          const right = (y * width + x + step) * 4;
          const distance = colorDistance(r, g, b, data[right], data[right + 1], data[right + 2]);
          if (distance < 3) flat += 1;
          else if (distance > 35) strong += 1;
          else gradient += 1;
        }
        if (y + step < height) {
          const below = ((y + step) * width + x) * 4;
          const distance = colorDistance(r, g, b, data[below], data[below + 1], data[below + 2]);
          if (distance < 3) flat += 1;
          else if (distance > 35) strong += 1;
          else gradient += 1;
        }
      }
    }

    const comparisons = Math.max(1, flat + strong + gradient);
    const uniqueColorRatio = clamp(colors.size / 180, 0, 1);
    const flatRatio = flat / comparisons;
    const strongEdgeRatio = strong / comparisons;
    const gradientRatio = gradient / comparisons;
    const transparentRatio = transparent / Math.max(1, samples);
    const meanChroma = chromaSum / Math.max(1, samples - transparent);
    const periodicity = collectRunLengths(data, width, height);
    const periodicitySignal = periodicity * clamp(strongEdgeRatio * 10, 0, 1);
    const lowColor = 1 - uniqueColorRatio;

    const rawScores = {
      pixelArt: 0.12 + lowColor * 0.24 + flatRatio * 0.18 + strongEdgeRatio * 0.32 + periodicitySignal * 0.38 + transparentRatio * 0.08,
      illustration: 0.24 + flatRatio * 0.34 + strongEdgeRatio * 0.18 + (1 - Math.abs(uniqueColorRatio - 0.38)) * 0.17 + Math.min(1, meanChroma / 90) * 0.08,
      photo: 0.16 + uniqueColorRatio * 0.3 + gradientRatio * 0.38 + (1 - flatRatio) * 0.16 - periodicitySignal * 0.12
    };
    const ordered = TYPES.map((type) => ({ type, score: Math.max(0.01, rawScores[type]) })).sort((a, b) => b.score - a.score);
    const total = ordered.reduce((sum, item) => sum + item.score, 0);
    const scores = {};
    ordered.forEach((item) => { scores[item.type] = item.score / total; });
    const gap = scores[ordered[0].type] - scores[ordered[1].type];
    const confidence = clamp(0.42 + gap * 1.35 + periodicitySignal * (ordered[0].type === "pixelArt" ? 0.16 : 0), 0.35, 0.98);
    const uncertain = confidence < 0.45;
    const type = uncertain ? "illustration" : ordered[0].type;
    return {
      version: VERSION,
      type,
      confidence,
      uncertain,
      scores,
      features: {
        transparentRatio,
        uniqueColors: colors.size,
        flatRatio,
        strongEdgeRatio,
        gradientRatio,
        periodicity: periodicitySignal,
        meanChroma
      }
    };
  }

  function getBorderColor(data, width, height) {
    let r = 0;
    let g = 0;
    let b = 0;
    let weight = 0;
    const add = (x, y) => {
      const offset = (y * width + x) * 4;
      const alpha = data[offset + 3] / 255;
      if (alpha < 0.1) return;
      r += data[offset] * alpha;
      g += data[offset + 1] * alpha;
      b += data[offset + 2] * alpha;
      weight += alpha;
    };
    for (let x = 0; x < width; x += 1) {
      add(x, 0);
      if (height > 1) add(x, height - 1);
    }
    for (let y = 1; y < height - 1; y += 1) {
      add(0, y);
      if (width > 1) add(width - 1, y);
    }
    return weight ? [r / weight, g / weight, b / weight] : [255, 255, 255];
  }

  function removeConnectedBackground(data, width, height, tolerance) {
    const output = new Uint8ClampedArray(data);
    const background = getBorderColor(data, width, height);
    const visited = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);
    let head = 0;
    let tail = 0;
    let removed = 0;
    const safeTolerance = clamp(tolerance, 4, 90) * 1.75;
    const enqueue = (position) => {
      if (position < 0 || position >= width * height || visited[position]) return;
      visited[position] = 1;
      const offset = position * 4;
      if (data[offset + 3] < 18 || colorDistance(data[offset], data[offset + 1], data[offset + 2], background[0], background[1], background[2]) <= safeTolerance) {
        queue[tail++] = position;
      }
    };
    for (let x = 0; x < width; x += 1) {
      enqueue(x);
      enqueue((height - 1) * width + x);
    }
    for (let y = 1; y < height - 1; y += 1) {
      enqueue(y * width);
      enqueue(y * width + width - 1);
    }
    while (head < tail) {
      const position = queue[head++];
      const offset = position * 4;
      if (output[offset + 3] > 0) {
        output[offset + 3] = 0;
        removed += 1;
      }
      const x = position % width;
      const y = Math.floor(position / width);
      if (x > 0) enqueue(position - 1);
      if (x + 1 < width) enqueue(position + 1);
      if (y > 0) enqueue(position - width);
      if (y + 1 < height) enqueue(position + width);
    }
    const removedRatio = removed / Math.max(1, width * height);
    return {
      data: removedRatio > 0.78 ? new Uint8ClampedArray(data) : output,
      removedRatio,
      rejected: removedRatio > 0.78
    };
  }

  function createImageProcessor(data, width, height, settings) {
    if (!data || !width || !height || data.length < width * height * 4) throw new Error("图像处理数据无效");
    const options = Object.assign(defaultSettings(settings && settings.type), settings || {});
    const source = new Uint8ClampedArray(data);
    const output = new Uint8ClampedArray(source.length);
    const exposureFactor = Math.pow(2, clamp(options.exposure, -100, 100) / 100);
    const contrast = clamp(options.contrast, 50, 150) / 100;
    const saturation = clamp(options.saturation, 0, 200) / 100;
    const denoise = clamp(options.denoise, 0, 50) / 100;
    const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const ditherStrength = options.dither === "on" ? 12 : options.dither === "auto" && options.type === "photo" ? 5 : 0;

    const processRows = (startRow, endRow) => {
      const start = clamp(Math.floor(startRow), 0, height);
      const end = clamp(Math.ceil(endRow), start, height);
      for (let y = start; y < end; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 4;
        let r = source[offset];
        let g = source[offset + 1];
        let b = source[offset + 2];
        if (denoise > 0 && x > 0 && x + 1 < width && y > 0 && y + 1 < height) {
          const offsets = [offset - 4, offset + 4, offset - width * 4, offset + width * 4];
          let nr = 0;
          let ng = 0;
          let nb = 0;
          offsets.forEach((neighbor) => {
            nr += source[neighbor];
            ng += source[neighbor + 1];
            nb += source[neighbor + 2];
          });
          r = r * (1 - denoise) + nr / 4 * denoise;
          g = g * (1 - denoise) + ng / 4 * denoise;
          b = b * (1 - denoise) + nb / 4 * denoise;
        }
        r *= exposureFactor;
        g *= exposureFactor;
        b *= exposureFactor;
        r = (r - 128) * contrast + 128;
        g = (g - 128) * contrast + 128;
        b = (b - 128) * contrast + 128;
        const luminance = r * 0.299 + g * 0.587 + b * 0.114;
        r = luminance + (r - luminance) * saturation;
        g = luminance + (g - luminance) * saturation;
        b = luminance + (b - luminance) * saturation;
        if (ditherStrength) {
          const adjustment = (bayer[(y % 4) * 4 + (x % 4)] / 15 - 0.5) * ditherStrength;
          r += adjustment;
          g += adjustment;
          b += adjustment;
        }
        output[offset] = clamp(Math.round(r), 0, 255);
        output[offset + 1] = clamp(Math.round(g), 0, 255);
        output[offset + 2] = clamp(Math.round(b), 0, 255);
        output[offset + 3] = source[offset + 3];
      }
      }
    };

    const finish = () => {
      let background = { data: output, removedRatio: 0, rejected: false };
      if (options.removeBackground) background = removeConnectedBackground(output, width, height, options.backgroundTolerance);
      return {
        version: VERSION,
        width,
        height,
        data: background.data,
        removedRatio: background.removedRatio,
        backgroundRejected: background.rejected,
        settings: options
      };
    };
    return { width, height, options, processRows, finish };
  }

  function processImageData(data, width, height, settings) {
    const processor = createImageProcessor(data, width, height, settings);
    processor.processRows(0, height);
    return processor.finish();
  }

  function sourceSize(source) {
    return {
      width: source && (source.naturalWidth || source.videoWidth || source.width) || 0,
      height: source && (source.naturalHeight || source.videoHeight || source.height) || 0
    };
  }

  function sourceCanvas(source, maxSide, smoothing) {
    if (typeof document === "undefined") throw new Error("当前环境不支持画布处理");
    const size = sourceSize(source);
    if (!size.width || !size.height) throw new Error("图片尺寸无效");
    const scale = Math.min(1, Math.max(1, maxSide || 1024) / Math.max(size.width, size.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(size.width * scale));
    canvas.height = Math.max(1, Math.round(size.height * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.imageSmoothingEnabled = smoothing !== false;
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  function analyzeSource(source, maxSide) {
    const canvas = sourceCanvas(source, maxSide || 320, true);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    return analyzeImageData(image.data, image.width, image.height);
  }

  function processSource(source, settings, maxSide) {
    const options = Object.assign(defaultSettings(settings && settings.type), settings || {});
    const canvas = sourceCanvas(source, maxSide || 1800, options.type !== "pixelArt");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const processed = processImageData(image.data, image.width, image.height, options);
    const next = context.createImageData(processed.width, processed.height);
    next.data.set(processed.data);
    context.putImageData(next, 0, 0);
    canvas.qPixelProcessing = {
      version: VERSION,
      removedRatio: processed.removedRatio,
      backgroundRejected: processed.backgroundRejected,
      settings: processed.settings
    };
    return canvas;
  }

  function degrees(value) {
    return value * 180 / Math.PI;
  }

  function radians(value) {
    return value * Math.PI / 180;
  }

  function deltaE2000(left, right) {
    const l1 = Number(left && left.l) || 0;
    const a1 = Number(left && left.a) || 0;
    const b1 = Number(left && left.b) || 0;
    const l2 = Number(right && right.l) || 0;
    const a2 = Number(right && right.a) || 0;
    const b2 = Number(right && right.b) || 0;
    const c1 = Math.sqrt(a1 * a1 + b1 * b1);
    const c2 = Math.sqrt(a2 * a2 + b2 * b2);
    const cBar = (c1 + c2) / 2;
    const cBar7 = Math.pow(cBar, 7);
    const g = 0.5 * (1 - Math.sqrt(cBar7 / (cBar7 + Math.pow(25, 7))));
    const a1p = (1 + g) * a1;
    const a2p = (1 + g) * a2;
    const c1p = Math.sqrt(a1p * a1p + b1 * b1);
    const c2p = Math.sqrt(a2p * a2p + b2 * b2);
    const h = (a, b) => {
      if (a === 0 && b === 0) return 0;
      const angle = degrees(Math.atan2(b, a));
      return angle >= 0 ? angle : angle + 360;
    };
    const h1p = h(a1p, b1);
    const h2p = h(a2p, b2);
    const dLp = l2 - l1;
    const dCp = c2p - c1p;
    let dhp = 0;
    if (c1p * c2p !== 0) {
      const diff = h2p - h1p;
      dhp = Math.abs(diff) <= 180 ? diff : diff > 180 ? diff - 360 : diff + 360;
    }
    const dHp = 2 * Math.sqrt(c1p * c2p) * Math.sin(radians(dhp / 2));
    const lBar = (l1 + l2) / 2;
    const cBarP = (c1p + c2p) / 2;
    let hBar = h1p + h2p;
    if (c1p * c2p !== 0) {
      hBar = Math.abs(h1p - h2p) <= 180 ? (h1p + h2p) / 2 : (h1p + h2p + (h1p + h2p < 360 ? 360 : -360)) / 2;
    }
    const t = 1 - 0.17 * Math.cos(radians(hBar - 30)) + 0.24 * Math.cos(radians(2 * hBar)) + 0.32 * Math.cos(radians(3 * hBar + 6)) - 0.2 * Math.cos(radians(4 * hBar - 63));
    const deltaTheta = 30 * Math.exp(-Math.pow((hBar - 275) / 25, 2));
    const rc = 2 * Math.sqrt(Math.pow(cBarP, 7) / (Math.pow(cBarP, 7) + Math.pow(25, 7)));
    const sl = 1 + 0.015 * Math.pow(lBar - 50, 2) / Math.sqrt(20 + Math.pow(lBar - 50, 2));
    const sc = 1 + 0.045 * cBarP;
    const sh = 1 + 0.015 * cBarP * t;
    const rt = -Math.sin(radians(2 * deltaTheta)) * rc;
    const lTerm = dLp / sl;
    const cTerm = dCp / sc;
    const hTerm = dHp / sh;
    return Math.sqrt(lTerm * lTerm + cTerm * cTerm + hTerm * hTerm + rt * cTerm * hTerm);
  }

  return {
    VERSION,
    TYPES: Object.freeze(TYPES.slice()),
    TYPE_LABELS,
    defaultSettings,
    analyzeImageData,
    createImageProcessor,
    processImageData,
    removeConnectedBackground,
    analyzeSource,
    processSource,
    deltaE2000
  };
});
