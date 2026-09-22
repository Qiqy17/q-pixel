(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelLegendSchema = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const VERSION = 1;
  function normalize(source) {
    const input = source && typeof source === "object" ? source : {};
    return {
      version: VERSION,
      brand: String(input.brand || ""),
      series: String(input.series || ""),
      mappings: Array.isArray(input.mappings) ? input.mappings.map((item) => ({
        symbol: String(item && item.symbol || ""),
        code: String(item && item.code || ""),
        count: Math.max(0, Number(item && item.count || 0)),
        region: String(item && item.region || ""),
        confidence: Math.max(0, Math.min(1, Number(item && item.confidence || 0))),
        source: item && item.source === "ocr-candidate" ? "ocr-candidate" : "manual"
      })).filter((item) => item.symbol || item.code) : []
    };
  }
  return Object.freeze({ VERSION, normalize });
});
