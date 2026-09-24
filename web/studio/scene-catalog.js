(function (root, factory) {
  const catalog = factory();
  if (typeof module === "object" && module.exports) module.exports = catalog;
  if (root) root.QPixelSceneCatalog = catalog;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const groups = Object.freeze([
    { label: "纸张手作", ids: ["paper-cotton", "kraft", "grid-paper"] },
    { label: "织物", ids: ["rough-linen", "fabric-felt", "fabric-soft"] },
    { label: "木石桌面", ids: ["wood", "white-plaster", "slate-board", "marble"] },
    { label: "摄影棚", ids: ["concrete-studio", "dark-studio"] }
  ]);
  const layouts = Object.freeze([
    { id: "center", label: "干净居中" },
    { id: "desk", label: "手作桌面" },
    { id: "info", label: "信息卡" },
    { id: "collage", label: "拼贴展示" }
  ]);
  const bitmaps = Object.freeze({
    "rough-linen": "/assets/materials/rough_linen_diff_1k.jpg",
    wood: "/assets/materials/synthetic_wood_diff_4k.jpg",
    "white-plaster": "/assets/materials/white_plaster_02_diff_1k.jpg",
    "slate-board": "/assets/materials/dark_rock_diff_1k.jpg",
    marble: "/assets/materials/marble_01_diff_4k.jpg",
    "concrete-studio": "/assets/materials/concrete_diff_4k.jpg"
  });
  const metadata = Object.freeze({
    "paper-cotton": { kind: "procedural", scaleHint: "fine", use: "浅色图案", light: "soft" },
    kraft: { kind: "procedural", scaleHint: "fine", use: "手作风", light: "soft" },
    "grid-paper": { kind: "procedural", scaleHint: "medium", use: "图纸展示", light: "soft" },
    "rough-linen": { kind: "bitmap", scaleHint: "fine", use: "柔和配色", light: "left", source: "https://polyhaven.com/a/rough_linen", license: "CC0" },
    "fabric-felt": { kind: "procedural", scaleHint: "fine", use: "暖色图案", light: "soft" },
    "fabric-soft": { kind: "procedural", scaleHint: "fine", use: "浅色图案", light: "soft" },
    wood: { kind: "bitmap", scaleHint: "broad", use: "手作风", light: "left", source: "https://polyhaven.com/a/synthetic_wood", license: "CC0" },
    "white-plaster": { kind: "bitmap", scaleHint: "medium", use: "多色图案", light: "soft", source: "https://polyhaven.com/a/white_plaster_02", license: "CC0" },
    "slate-board": { kind: "bitmap", scaleHint: "medium", use: "浅色图案", light: "left", source: "https://polyhaven.com/a/dark_rock", license: "CC0" },
    marble: { kind: "bitmap", scaleHint: "broad", use: "深色图案", light: "soft", source: "https://polyhaven.com/a/marble_01", license: "CC0" },
    "concrete-studio": { kind: "bitmap", scaleHint: "medium", use: "色彩检查", light: "front", source: "https://polyhaven.com/a/concrete", license: "CC0" },
    "dark-studio": { kind: "procedural", scaleHint: "medium", use: "浅色及透明豆", light: "front" }
  });
  return Object.freeze({ groups, layouts, metadata, bitmaps });
});
