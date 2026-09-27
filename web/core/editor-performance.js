(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelEditorPerformance = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function visibleCellRange(width, height, x, y, cellSize, viewportWidth, viewportHeight) {
    if (!(cellSize > 0)) return { firstRow: 0, lastRow: 0, firstCol: 0, lastCol: 0 };
    const clamp = (value, limit) => Math.max(0, Math.min(limit, value));
    return {
      firstRow: clamp(Math.floor(-y / cellSize), height),
      lastRow: clamp(Math.ceil((viewportHeight - y) / cellSize), height),
      firstCol: clamp(Math.floor(-x / cellSize), width),
      lastCol: clamp(Math.ceil((viewportWidth - x) / cellSize), width)
    };
  }

  function historySnapshotLimit(width, height, layerCount) {
    const cellsPerSnapshot = Math.max(1, width * height * Math.max(1, layerCount));
    return Math.max(3, Math.min(80, Math.floor(3000000 / cellsPerSnapshot)));
  }

  return Object.freeze({ visibleCellRange, historySnapshotLimit });
});
