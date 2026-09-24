(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelFinishCore = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  // 十类熨烫状态的通用参数化模型；标定完成后由 calibration-manifest 接管参数。
  const PROFILES = Object.freeze([
    Object.freeze({ id: "raw", label: "未烫", height: 4.35, hole: .35, backHole: .35, spread: 0, bridge: 0, roughness: .42 }),
    Object.freeze({ id: "light", label: "轻烫保孔", height: 4.05, hole: .28, backHole: .29, spread: .035, bridge: .025, roughness: .4 }),
    Object.freeze({ id: "standard", label: "标准融合", height: 3.6, hole: .20, backHole: .21, spread: .075, bridge: .085, roughness: .46 }),
    Object.freeze({ id: "flat", label: "完全平融", height: 2.75, hole: .012, backHole: .12, spread: .17, bridge: .16, roughness: .5 }),
    Object.freeze({ id: "back", label: "背熔混合", height: 3.85, hole: .33, backHole: .075, spread: .07, bridge: .10, roughness: .42 }),
    Object.freeze({ id: "towel", label: "毛巾烫", height: 3.45, hole: .17, backHole: .20, spread: .095, bridge: .09, roughness: .72, texture: "towel" }),
    Object.freeze({ id: "bath", label: "澡巾烫", height: 3.38, hole: .16, backHole: .19, spread: .10, bridge: .10, roughness: .65, texture: "bath" }),
    Object.freeze({ id: "waffle", label: "华夫格烫", height: 3.36, hole: .15, backHole: .18, spread: .11, bridge: .11, roughness: .61, texture: "waffle" }),
    Object.freeze({ id: "glitter", label: "闪片烫", height: 3.55, hole: .19, backHole: .21, spread: .075, bridge: .08, roughness: .31, texture: "glitter", glitter: true }),
    Object.freeze({ id: "laser", label: "镭射烫", height: 3.55, hole: .19, backHole: .21, spread: .075, bridge: .08, roughness: .26, texture: "film", iridescence: true })
  ]);

  function profile(id) {
    return PROFILES.find((item) => item.id === id) || PROFILES[0];
  }

  // 标定状态：读取 manifest 判断当前是通用模型还是实测模型；失败时按未标定处理。
  function readManifestSync() {
    const globalRef = typeof window !== "undefined" ? window : globalThis;
    if (globalRef && globalRef.__QPIXEL_CALIBRATION_MANIFEST__ && typeof globalRef.__QPIXEL_CALIBRATION_MANIFEST__ === "object") {
      return globalRef.__QPIXEL_CALIBRATION_MANIFEST__;
    }
    return { status: "uncalibrated", profiles: [] };
  }

  function isCalibrated() {
    return readManifestSync().status === "calibrated";
  }

  // 图纸结构分析：豆数、邻接对（渲染连接桥用）、孤点数。
  function analyze(cells) {
    if (!Array.isArray(cells)) return { count: 0, horizontal: 0, vertical: 0, isolated: 0 };
    let count = 0, horizontal = 0, vertical = 0, isolated = 0;
    for (let row = 0; row < cells.length; row += 1) {
      for (let col = 0; col < (cells[row] || []).length; col += 1) {
        if (!cells[row][col]) continue;
        count += 1;
        if (cells[row][col + 1]) horizontal += 1;
        if (cells[row + 1] && cells[row + 1][col]) vertical += 1;
        const hasNeighbor = cells[row][col - 1] || cells[row][col + 1] || (cells[row - 1] && cells[row - 1][col]) || (cells[row + 1] && cells[row + 1][col]);
        if (!hasNeighbor) isolated += 1;
      }
    }
    return { count, horizontal, vertical, isolated };
  }

  // LOD：豆数与视口共同决定几何精度档位；弱设备在渲染层再降一档。
  function lod(count, viewportWidth) {
    if (count > 90000 || viewportWidth < 620) return "low";
    if (count > 12000) return "medium";
    return "high";
  }

  function normalizeSettings(input) {
    const value = input && typeof input === "object" ? input : {};
    return {
      version: 1,
      profile: profile(value.profile).id,
      exposure: Math.max(.5, Math.min(2, Number(value.exposure) || 1)),
      side: ["front", "back", "angle"].includes(value.side) ? value.side : "angle",
      background: ["photo", "dark", "transparent"].includes(value.background) ? value.background : "photo",
      calibrated: isCalibrated()
    };
  }

  return Object.freeze({ PROFILES, profile, analyze, lod, normalizeSettings, readManifestSync, isCalibrated });
});
