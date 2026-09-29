(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.QPixelLayerTranslate = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function dimensions(cells) {
    if (!Array.isArray(cells) || !cells.length || !Array.isArray(cells[0]) || !cells[0].length ||
        cells.some((row) => !Array.isArray(row) || row.length !== cells[0].length)) {
      throw new TypeError("图层格子必须是完整的矩形");
    }
    return { width: cells[0].length, height: cells.length };
  }

  function project(contentCells, originCol, originRow, width, height) {
    dimensions(contentCells);
    if (![originCol, originRow, width, height].every(Number.isInteger) || width < 1 || height < 1) {
      throw new TypeError("图层位置或画布尺寸无效");
    }
    return Array.from({ length: height }, (_, row) =>
      Array.from({ length: width }, (_, col) =>
        contentCells[row - originRow]?.[col - originCol] || null));
  }

  function reconcile(contentCells, originCol, originRow, visibleCells) {
    const source = dimensions(contentCells);
    const view = dimensions(visibleCells);
    let changed = false;
    let minCol = originCol;
    let minRow = originRow;
    let maxCol = originCol + source.width - 1;
    let maxRow = originRow + source.height - 1;
    for (let row = 0; row < view.height; row += 1) {
      for (let col = 0; col < view.width; col += 1) {
        const current = contentCells[row - originRow]?.[col - originCol] || null;
        const next = visibleCells[row][col] || null;
        if (current === next) continue;
        changed = true;
        if (next) {
          minCol = Math.min(minCol, col);
          minRow = Math.min(minRow, row);
          maxCol = Math.max(maxCol, col);
          maxRow = Math.max(maxRow, row);
        }
      }
    }
    if (!changed) return { contentCells, originCol, originRow, changed: false };
    const nextCells = Array.from({ length: maxRow - minRow + 1 }, () => Array(maxCol - minCol + 1).fill(null));
    for (let row = 0; row < source.height; row += 1) {
      for (let col = 0; col < source.width; col += 1) {
        nextCells[originRow + row - minRow][originCol + col - minCol] = contentCells[row][col];
      }
    }
    for (let row = 0; row < view.height; row += 1) {
      for (let col = 0; col < view.width; col += 1) {
        const targetRow = row - minRow;
        const targetCol = col - minCol;
        if (nextCells[targetRow]?.[targetCol] !== undefined) nextCells[targetRow][targetCol] = visibleCells[row][col] || null;
      }
    }
    return { contentCells: nextCells, originCol: minCol, originRow: minRow, changed: true };
  }

  function occupied(cells) {
    return cells.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
  }

  return { dimensions, project, reconcile, occupied };
});
