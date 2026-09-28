(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.QPixelDesignSaveAs = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function emptyCells(height, width) {
    return Array.from({ length: height }, () => Array(width).fill(null));
  }

  function mergeCells(layers, width, height) {
    const cells = emptyCells(height, width);
    layers.forEach((layer) => {
      for (let row = 0; row < height; row += 1) {
        for (let col = 0; col < width; col += 1) {
          const code = layer.cells && layer.cells[row] && layer.cells[row][col];
          if (code) cells[row][col] = code;
        }
      }
    });
    return cells;
  }

  function cropLayer(layer, pattern, minimumSize) {
    const region = layer.tileRegion;
    if (!region) return {
      width: pattern.width,
      height: pattern.height,
      cells: Array.from({ length: pattern.height }, (_, row) =>
        Array.from({ length: pattern.width }, (_, col) => layer.cells?.[row]?.[col] || null))
    };
    const { startRow, startCol, width, height } = region;
    if (![startRow, startCol, width, height].every(Number.isInteger) ||
        startRow < 0 || startCol < 0 || width < 1 || height < 1 ||
        startRow + height > pattern.height || startCol + width > pattern.width) {
      throw new Error("分区图层范围无效");
    }
    const outputWidth = Math.max(width, minimumSize || 1);
    const outputHeight = Math.max(height, minimumSize || 1);
    return {
      width: outputWidth, height: outputHeight,
      cells: Array.from({ length: outputHeight }, (_, row) =>
        Array.from({ length: outputWidth }, (_, col) =>
          row < height && col < width ? layer.cells?.[startRow + row]?.[startCol + col] || null : null))
    };
  }

  function createPayload(source, choice, id, now, minimumSize) {
    if (!source?.pattern || !Array.isArray(source.layers) || !source.layers.length) throw new Error("当前设计没有图层");
    const title = String(choice.title || "").trim();
    if (!title) throw new Error("请输入新设计文件名");
    const selected = choice.layerId ? source.layers.find((layer) => layer.id === choice.layerId) : null;
    if (choice.layerId && !selected) throw new Error("选中的图层不存在");
    const pattern = selected
      ? cropLayer(selected, source.pattern, minimumSize)
      : { width: source.pattern.width, height: source.pattern.height,
          cells: mergeCells(source.layers, source.pattern.width, source.pattern.height) };
    const layerId = `${id}-layer`;
    const timestamp = now || new Date().toISOString();
    return {
      ...source,
      id, title, createdAt: timestamp, savedAt: timestamp,
      sourceLabel: selected ? `另存自图层：${selected.name || "图层"}` : "另存自合并图层",
      importRecipe: null,
      importSource: null,
      rebuildReport: null,
      pattern: { ...pattern },
      layers: [{ id: layerId, name: selected ? selected.name || title : "合并图层",
        visible: true, locked: false, alphaLocked: false, groupName: "", tileRegion: null,
        cells: pattern.cells.map((row) => row.slice()) }],
      activeLayerId: layerId,
      tileLayout: null,
      exportRegions: [],
      exportSettings: { ...source.exportSettings, regionEnabled: false,
        regionSelectedId: "", regionPreviewIds: [] },
      checkpoints: [],
      buildProgress: {},
      boardPlan: null,
      finish3d: null,
      editorSettings: { ...source.editorSettings, guideLines: [] }
    };
  }

  return { mergeCells, cropLayer, createPayload };
});
