(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelSmartBoardExport = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  function integer(value, min, max, label) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${label}须为${min}至${max}的整数。`);
    return n;
  }
  function plan(pattern, palette, settings = {}) {
    if (!pattern || !Array.isArray(pattern.cells)) throw new Error("请先创建或导入图纸。");
    const width = integer(pattern.width, 1, 500, "图纸宽度"), height = integer(pattern.height, 1, 500, "图纸高度");
    const columns = integer(settings.columns ?? 52, 1, 500, "板宽"), rows = integer(settings.rows ?? 52, 1, 500, "板高");
    const rotation = Number(settings.rotation || 0);
    if (![0, 90, 180, 270].includes(rotation)) throw new Error("旋转角度无效。");
    const colors = new Map(palette.map((color) => [color.code, color]));
    const unknown = new Set();
    const targetWidth = rotation % 180 ? height : width, targetHeight = rotation % 180 ? width : height;
    if (Math.ceil(targetWidth / columns) * Math.ceil(targetHeight / rows) > 2000) throw new Error("分板超过2000块，请增大板尺寸。");
    const cells = Array.from({ length: targetHeight }, () => Array(targetWidth).fill(null));
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const code = pattern.cells[y]?.[x] ?? null;
      if (code !== null && !colors.has(code)) unknown.add(code);
      const mx = settings.mirror ? width - 1 - x : x;
      const tx = rotation === 90 ? height - 1 - y : rotation === 180 ? width - 1 - mx : rotation === 270 ? y : mx;
      const ty = rotation === 90 ? mx : rotation === 180 ? height - 1 - y : rotation === 270 ? width - 1 - mx : y;
      cells[ty][tx] = code;
    }
    if (unknown.size) throw new Error(`色板缺少这些色号，已停止导出：${Array.from(unknown).join("、")}`);
    const boards = [], totals = new Map();
    for (let y = 0; y < targetHeight; y += rows) for (let x = 0; x < targetWidth; x += columns) {
      const usage = new Map(), validColumns = Math.min(columns, targetWidth - x), validRows = Math.min(rows, targetHeight - y);
      // Read source coordinates lazily: small custom boards must not create hundreds of thousands of padded arrays.
      const board = { index: boards.length + 1, x, y, columns, rows, validColumns, validRows };
      for (let by = 0; by < validRows; by++) for (let bx = 0; bx < validColumns; bx++) {
        const code = cells[y + by][x + bx];
        if (code === null) continue;
        usage.set(code, (usage.get(code) || 0) + 1); totals.set(code, (totals.get(code) || 0) + 1);
      }
      board.usage = Array.from(usage, ([code, count]) => ({ code, count })).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
      boards.push(board);
    }
    return { source: { width, height }, width: targetWidth, height: targetHeight, columns, rows, rotation, mirror: !!settings.mirror,
      cells, boards, colors, usage: Array.from(totals, ([code, count]) => ({ code, count })) };
  }
  function codeAt(plan, board, x, y) {
    return x < board.validColumns && y < board.validRows ? plan.cells[board.y + y][board.x + x] : null;
  }
  function rgb(color) {
    const value = color?.rgb;
    const channels = Array.isArray(value) ? value : [value?.r, value?.g, value?.b];
    if (channels.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) throw new Error(`色号${color?.code || ""}的RGB无效。`);
    return channels;
  }
  function rgba(plan, board, onlyCode) {
    const bytes = new Uint8ClampedArray(board.columns * board.rows * 4);
    for (let y = 0; y < board.rows; y++) for (let x = 0; x < board.columns; x++) {
      const code = codeAt(plan, board, x, y);
      if (code === null || (onlyCode !== undefined && onlyCode !== code)) continue;
      bytes.set([...rgb(plan.colors.get(code)), 255], (y * board.columns + x) * 4);
    }
    return bytes;
  }
  function rgb888(plan, board, onlyCode) {
    const image = rgba(plan, board, onlyCode), bytes = new Uint8Array(board.columns * board.rows * 3);
    for (let i = 0; i < bytes.length / 3; i++) bytes.set(image.subarray(i * 4, i * 4 + 3), i * 3);
    return bytes;
  }
  function csv(plan) {
    const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [["范围", "板号", "色号", "R", "G", "B", "数量"]];
    const add = (scope, index, usage) => usage.forEach((item) => lines.push([scope, index, item.code, ...rgb(plan.colors.get(item.code)), item.count]));
    add("全图", "", plan.usage); plan.boards.forEach((b) => add("分板", b.index, b.usage));
    return "\uFEFF" + lines.map((line) => line.map(escape).join(",")).join("\r\n");
  }
  return Object.freeze({ plan, codeAt, rgb, rgba, rgb888, csv });
});
