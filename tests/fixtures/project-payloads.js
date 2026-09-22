"use strict";

function makeCells(width, height, density) {
  return Array.from({ length: height }, (_, row) => Array.from({ length: width }, (_, col) => {
    const slot = (row * width + col) % 100;
    if (slot >= density) return null;
    return ["A1", "B8", "C7", "E11", "H7"][(row + col) % 5];
  }));
}

function makePayload(id, width, height, density) {
  return {
    version: 1,
    app: "Q像素",
    type: "bead-pattern",
    id,
    title: id,
    createdAt: "2026-09-22T00:00:00.000Z",
    savedAt: "2026-09-22T00:00:00.000Z",
    palette: "Mard-221",
    pattern: { width, height, cells: makeCells(width, height, density) },
    layers: [],
    activeLayerId: "",
    buildProgress: {},
    exportSettings: {},
    exportRegions: [],
    editorSettings: {}
  };
}

module.exports = {
  small: () => makePayload("fixture-small", 8, 8, 55),
  medium: () => makePayload("fixture-medium", 80, 60, 72),
  sparse500: () => makePayload("fixture-500-sparse", 500, 500, 8),
  dense500: () => makePayload("fixture-500-dense", 500, 500, 96)
};
