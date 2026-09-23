(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelFinishCore = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  // 十类熨烫状态的通用参数化模型；标定完成后由 calibration-manifest 接管参数。
  const PROFILES = Object.freeze([
    Object.freeze({ id: "raw", label: "未烫", height: 3.2, hole: .34, spread: 0, bridge: 0, roughness: .41 }),
    Object.freeze({ id: "light", label: "轻烫保孔", height: 2.8, hole: .27, spread: .03, bridge: .025, roughness: .37 }),
    Object.freeze({ id: "standard", label: "标准融合", height: 2.4, hole: .19, spread: .07, bridge: .075, roughness: .43 }),
    Object.freeze({ id: "flat", label: "完全平融", height: 1.8, hole: .015, spread: .13, bridge: .15, roughness: .48 }),
    Object.freeze({ id: "back", label: "背熔混合", height: 2.45, hole: .25, spread: .06, bridge: .08, roughness: .39 }),
    Object.freeze({ id: "towel", label: "毛巾烫", height: 2.3, hole: .20, spread: .08, bridge: .08, roughness: .69 }),
    Object.freeze({ id: "bath", label: "澡巾烫", height: 2.28, hole: .18, spread: .09, bridge: .09, roughness: .61 }),
    Object.freeze({ id: "waffle", label: "华夫格烫", height: 2.25, hole: .17, spread: .10, bridge: .10, roughness: .58 }),
    Object.freeze({ id: "glitter", label: "闪片烫", height: 2.35, hole: .19, spread: .07, bridge: .07, roughness: .28, glitter: true }),
    Object.freeze({ id: "laser", label: "镭射烫", height: 2.34, hole: .18, spread: .07, bridge: .07, roughness: .24, iridescence: true })
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
      side: ["front", "back"].includes(value.side) ? value.side : "front",
      background: ["photo", "transparent"].includes(value.background) ? value.background : "photo",
      calibrated: isCalibrated()
    };
  }

  return Object.freeze({ PROFILES, profile, analyze, lod, normalizeSettings, readManifestSync, isCalibrated });
});
