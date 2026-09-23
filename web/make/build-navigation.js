(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelBuildNavigation = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const NAVIGATION_VERSION = "build-navigation-1";
  const NAVIGATION_MODES = Object.freeze(["color", "row", "region"]);

  function keyOf(row, col) { return `${row}:${col}`; }

  function clampCell(cells, row, col) {
    if (!Array.isArray(cells) || row < 0 || col < 0 || row >= cells.length) return null;
    const line = cells[row];
    if (!Array.isArray(line) || col >= line.length) return null;
    return line[col] || null;
  }

  // 图纸用量统计：{ code: count }，空格不计。
  function computeUsage(cells) {
    const usage = new Map();
    if (!Array.isArray(cells)) return usage;
    cells.forEach((line) => {
      if (!Array.isArray(line)) return;
      line.forEach((code) => {
        if (code) usage.set(code, (usage.get(code) || 0) + 1);
      });
    });
    return usage;
  }

  // 全图进度与分色进度。
  function computeProgress(cells, buildProgress) {
    const progress = buildProgress || {};
    let total = 0, done = 0;
    const byCode = new Map();
    if (Array.isArray(cells)) {
      cells.forEach((line, row) => {
        if (!Array.isArray(line)) return;
        line.forEach((code, col) => {
          if (!code) return;
          total += 1;
          const entry = byCode.get(code) || { code, total: 0, done: 0 };
          entry.total += 1;
          if (progress[keyOf(row, col)]) { done += 1; entry.done += 1; }
          byCode.set(code, entry);
        });
      });
    }
    const colors = Array.from(byCode.values()).sort((a, b) => b.total - a.total || a.code.localeCompare(b.code));
    return { total, done, remaining: Math.max(0, total - done), percent: total ? Math.round(done / total * 100) : 0, colors };
  }

  // 按色导航：返回该色下一个未拼格（行优先扫描，可从指定位置之后继续）。
  function nextCellByColor(cells, buildProgress, code, options) {
    if (!code || !Array.isArray(cells)) return null;
    const progress = buildProgress || {};
    const settings = options || {};
    const afterRow = Number.isFinite(Number(settings.afterRow)) ? Number(settings.afterRow) : -1;
    const afterCol = Number.isFinite(Number(settings.afterCol)) ? Number(settings.afterCol) : -1;
    for (let pass = 0; pass < 2; pass += 1) {
      for (let row = 0; row < cells.length; row += 1) {
        const line = cells[row];
        if (!Array.isArray(line)) continue;
        for (let col = 0; col < line.length; col += 1) {
          if (line[col] !== code || progress[keyOf(row, col)]) continue;
          if (pass === 0 && (row < afterRow || (row === afterRow && col <= afterCol))) continue;
          return { row, col, code };
        }
      }
    }
    return null;
  }

  // 按行导航：返回下一行中尚未拼制的格子序列（不区分色号）。
  function planRowRun(cells, buildProgress, options) {
    if (!Array.isArray(cells)) return [];
    const progress = buildProgress || {};
    const settings = options || {};
    const fromRow = Math.max(0, Math.floor(Number(settings.fromRow) || 0));
    const limit = Math.max(1, Math.floor(Number(settings.limit) || 48));
    const run = [];
    for (let row = fromRow; row < cells.length && run.length < limit; row += 1) {
      const line = cells[row];
      if (!Array.isArray(line)) continue;
      for (let col = 0; col < line.length && run.length < limit; col += 1) {
        const code = line[col];
        if (!code || progress[keyOf(row, col)]) continue;
        run.push({ row, col, code });
      }
      if (run.length) break;
    }
    return run;
  }

  // 按区域（底板）导航：返回指定底板内下一批未拼格。
  function planRegionRun(cells, buildProgress, board, options) {
    if (!Array.isArray(cells) || !board) return [];
    const progress = buildProgress || {};
    const settings = options || {};
    const limit = Math.max(1, Math.floor(Number(settings.limit) || 48));
    const run = [];
    for (let row = board.rowStart; row < board.rowStart + board.rows && run.length < limit; row += 1) {
      const line = cells[row];
      if (!Array.isArray(line)) continue;
      for (let col = board.columnStart; col < board.columnStart + board.columns && run.length < limit; col += 1) {
        const code = clampCell(cells, row, col);
        if (!code || progress[keyOf(row, col)]) continue;
        run.push({ row, col, code });
      }
    }
    return run;
  }

  // 自动前进：返回下一个未完成的色号；全部完成时返回当前色号。
  function advanceColor(cells, buildProgress, currentCode, options) {
    const settings = options || {};
    const direction = Number(settings.direction) >= 0 ? 1 : -1;
    const progressData = computeProgress(cells, buildProgress);
    let order = progressData.colors.slice();
    if (settings.sortMode === "code") order = order.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    if (!order.length) return "";
    const startIndex = Math.max(0, order.findIndex((item) => item.code === currentCode));
    for (let offset = 1; offset <= order.length; offset += 1) {
      const item = order[(startIndex + direction * offset + order.length * 2) % order.length];
      if (item.done < item.total || offset === order.length) return item.code;
    }
    return currentCode || order[0].code;
  }

  // 单格拼制状态切换：返回新的进度对象，不修改输入。
  function toggleCell(buildProgress, row, col, forced) {
    const progress = Object.assign({}, buildProgress || {});
    const key = keyOf(row, col);
    const next = typeof forced === "boolean" ? forced : !progress[key];
    if (next) progress[key] = true;
    else delete progress[key];
    return progress;
  }

  return Object.freeze({ NAVIGATION_VERSION, NAVIGATION_MODES, computeUsage, computeProgress, nextCellByColor, planRowRun, planRegionRun, advanceColor, toggleCell, keyOf });
});
