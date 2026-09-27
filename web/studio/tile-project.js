(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelTileProject = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function divide(pattern, rows, cols) {
    if (!pattern || !Number.isInteger(pattern.width) || !Number.isInteger(pattern.height) || !Array.isArray(pattern.cells)) throw new Error("图纸无效");
    if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1 || rows > 4 || cols > 4 || rows > pattern.height || cols > pattern.width) throw new Error("分区行列数须为 1–4 且不能超过图纸尺寸");
    if (pattern.cells.length !== pattern.height || pattern.cells.some((line) => !Array.isArray(line) || line.length !== pattern.width)) throw new Error("图纸网格不完整");
    const regions = [], layers = [];
    for (let r = 0; r < rows; r++) {
      const startRow = Math.floor(r * pattern.height / rows);
      const endRow = Math.floor((r + 1) * pattern.height / rows);
      for (let c = 0; c < cols; c++) {
        const startCol = Math.floor(c * pattern.width / cols);
        const endCol = Math.floor((c + 1) * pattern.width / cols);
        const region = { id: `tile-${r + 1}-${c + 1}`, name: `画布 ${r + 1}-${c + 1}`, startRow, startCol, height: endRow - startRow, width: endCol - startCol };
        const cells = Array.from({ length: pattern.height }, (_, row) => Array.from({ length: pattern.width }, (_, col) =>
          row >= startRow && row < endRow && col >= startCol && col < endCol ? pattern.cells[row][col] : null
        ));
        regions.push(region); layers.push({ region, cells });
      }
    }
    return { rows, cols, regions, layers };
  }

  function contains(region, row, col) {
    return Boolean(region && row >= region.startRow && row < region.startRow + region.height && col >= region.startCol && col < region.startCol + region.width);
  }

  function usage(cells, region) {
    const counts = new Map();
    for (let row = region.startRow; row < region.startRow + region.height; row++) {
      for (let col = region.startCol; col < region.startCol + region.width; col++) {
        const code = cells[row]?.[col];
        if (code) counts.set(code, (counts.get(code) || 0) + 1);
      }
    }
    return Object.fromEntries(counts);
  }

  function validLayout(pattern, layout, layers) {
    if (!layout || !Array.isArray(layers)) return false;
    const rows = layout.rows, cols = layout.cols;
    if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1 || rows > 4 || cols > 4 || rows > pattern.height || cols > pattern.width || layers.length !== rows * cols) return false;
    return layers.every((layer, index) => {
      const r = Math.floor(index / cols), c = index % cols;
      const startRow = Math.floor(r * pattern.height / rows), startCol = Math.floor(c * pattern.width / cols);
      const region = { startRow, startCol, height: Math.floor((r + 1) * pattern.height / rows) - startRow, width: Math.floor((c + 1) * pattern.width / cols) - startCol };
      const actual = layer.tileRegion;
      if (!actual || !Array.isArray(layer.cells) || layer.cells.length !== pattern.height) return false;
      if (["startRow", "startCol", "height", "width"].some((key) => actual[key] !== region[key])) return false;
      return layer.cells.every((line, row) => Array.isArray(line) && line.length === pattern.width &&
        line.every((code, col) => !code || contains(region, row, col)));
    });
  }

  return Object.freeze({ divide, contains, usage, validLayout });
});
