(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.QPixelLayerTranslate = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function translate(cells, width, height, dx, dy) {
    if (!Array.isArray(cells) || !Number.isInteger(width) || !Number.isInteger(height) ||
        width < 1 || height < 1 || !Number.isInteger(dx) || !Number.isInteger(dy) ||
        cells.length !== height || cells.some((row) => !Array.isArray(row) || row.length !== width)) {
      throw new TypeError("图层格子或移动距离无效");
    }
    const result = Array.from({ length: height }, () => Array(width).fill(null));
    let moved = 0;
    let clipped = 0;
    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width; col += 1) {
        const code = cells[row][col];
        if (!code) continue;
        const targetRow = row + dy;
        const targetCol = col + dx;
        if (targetRow < 0 || targetRow >= height || targetCol < 0 || targetCol >= width) {
          clipped += 1;
        } else {
          result[targetRow][targetCol] = code;
          moved += 1;
        }
      }
    }
    return { cells: result, moved, clipped };
  }

  return { translate };
});
