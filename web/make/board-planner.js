(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelBoardPlanner = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const PLANNER_VERSION = "board-planner-1";

  // 常见 5mm 拼豆底板规格；尺寸为可拼格数（含边缘）。
  const BOARD_SPECS = Object.freeze([
    Object.freeze({ id: "standard-29", label: "标准方板 29 × 29", columns: 29, rows: 29, beadDiameterMm: 5, note: "MARD / Hama Midi 等主流 5mm 方板" }),
    Object.freeze({ id: "standard-15", label: "小板 15 × 15", columns: 15, rows: 15, beadDiameterMm: 5, note: "小尺寸练习板" }),
    Object.freeze({ id: "standard-14", label: "圆板 14 × 14", columns: 14, rows: 14, beadDiameterMm: 5, note: "圆形板内切区域" }),
    Object.freeze({ id: "standard-52", label: "大板 52 × 52", columns: 52, rows: 52, beadDiameterMm: 5, note: "整版大底板" })
  ]);

  function clampIndex(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function getSpec(id) {
    return BOARD_SPECS.find((spec) => spec.id === String(id || "")) || BOARD_SPECS[0];
  }

  // 依据列/行断点切分边界序列；step 为底板规格尺寸，seams 为格子分隔线索引（1..size-1）。
  function boundariesFromSize(size, step, seams) {
    if (Number.isFinite(Number(step)) && Number(step) > 0) {
      const interval = Math.max(4, Math.floor(Number(step)));
      const cuts = [];
      for (let at = interval; at < size; at += interval) cuts.push(at);
      cuts.push(size);
      return cuts;
    }
    const cuts = (Array.isArray(seams) ? seams : [])
      .map((seam) => Math.floor(Number(seam && seam.line !== undefined ? seam.line : seam)))
      .filter((line) => Number.isInteger(line) && line > 0 && line < 100000)
      .sort((a, b) => a - b);
    const boundaries = [];
    let previous = 0;
    cuts.forEach((cut) => {
      if (cut > previous) { boundaries.push(cut); previous = cut; }
    });
    if (previous < 100000) boundaries.push(100000);
    return boundaries.length ? boundaries : [100000];
  }

  // Prefer a nearby detected seam without ever producing a board larger than the selected physical board.
  function boundedSeamCuts(size, step, seams) {
    const candidates = (Array.isArray(seams) ? seams : [])
      .map((seam) => Math.floor(Number(seam && seam.line !== undefined ? seam.line : seam)))
      .filter((line) => Number.isInteger(line) && line > 0 && line < size)
      .sort((a, b) => a - b);
    const cuts = [];
    let start = 0;
    while (start + step < size) {
      const limit = start + step;
      const minimum = start + Math.max(1, Math.floor(step / 2));
      const preferred = candidates.filter((line) => line >= minimum && line <= limit).pop();
      const next = preferred || limit;
      cuts.push(next);
      start = next;
    }
    cuts.push(size);
    return cuts;
  }

  // 分割图纸为底板列表；可选用重建报告的底板缝对齐真实拼接线。
  function splitPattern(pattern, options) {
    const settings = options || {};
    if (!pattern || !Array.isArray(pattern.cells)) return [];
    const height = Math.max(0, Math.floor(Number(pattern.height) || pattern.cells.length));
    const width = Math.max(0, Math.floor(Number(pattern.width) || (pattern.cells[0] ? pattern.cells[0].length : 0)));
    if (!height || !width) return [];
    const spec = getSpec(settings.specId);
    const columnCuts = settings.preferSeams
      ? boundedSeamCuts(width, spec.columns, settings.seamColumns)
      : boundariesFromSize(width, spec.columns);
    const rowCuts = settings.preferSeams
      ? boundedSeamCuts(height, spec.rows, settings.seamRows)
      : boundariesFromSize(height, spec.rows);
    const boards = [];
    let rowStart = 0;
    let boardIndex = 0;
    rowCuts.forEach((rowCut) => {
      const rowEnd = clampIndex(rowCut, 1, height);
      let columnStart = 0;
      columnCuts.forEach((columnCut) => {
        const columnEnd = clampIndex(columnCut, 1, width);
        boardIndex += 1;
        const board = {
          id: `board-${boardIndex}`,
          index: boardIndex,
          columnStart,
          rowStart,
          columns: columnEnd - columnStart,
          rows: rowEnd - rowStart,
          cellCount: 0,
          usage: []
        };
        const usageMap = new Map();
        for (let row = rowStart; row < rowEnd; row += 1) {
          const line = pattern.cells[row];
          if (!Array.isArray(line)) continue;
          for (let col = columnStart; col < columnEnd; col += 1) {
            const code = line[col];
            if (!code) continue;
            board.cellCount += 1;
            usageMap.set(code, (usageMap.get(code) || 0) + 1);
          }
        }
        usageMap.forEach((count, code) => board.usage.push({ code, count }));
        board.usage.sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));
        boards.push(board);
        columnStart = columnEnd;
      });
      rowStart = rowEnd;
    });
    return boards;
  }

  // 板级进度：buildProgress 键为 "row:col"。
  function progressOfBoard(board, buildProgress) {
    if (!board) return { done: 0, total: 0, percent: 0 };
    const progress = buildProgress || {};
    let done = 0;
    for (let row = board.rowStart; row < board.rowStart + board.rows; row += 1) {
      for (let col = board.columnStart; col < board.columnStart + board.columns; col += 1) {
        if (progress[`${row}:${col}`]) done += 1;
      }
    }
    return { done, total: board.cellCount, percent: board.cellCount ? Math.round(done / board.cellCount * 100) : 0 };
  }

  // 每板材料数量与全图总表；与 splitPattern 的 usage 一致，可独立校验。
  function summarizeBoards(boards) {
    const total = new Map();
    (boards || []).forEach((board) => {
      (board.usage || []).forEach((item) => total.set(item.code, (total.get(item.code) || 0) + item.count));
    });
    const usage = Array.from(total, ([code, count]) => ({ code, count })).sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));
    return { boards: (boards || []).length, colors: usage.length, totalCells: usage.reduce((sum, item) => sum + item.count, 0), usage };
  }

  return Object.freeze({ PLANNER_VERSION, BOARD_SPECS, getSpec, splitPattern, progressOfBoard, summarizeBoards, boundariesFromSize });
});
