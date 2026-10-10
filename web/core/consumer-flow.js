(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelConsumerFlow = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  function summary(pattern, progress = {}) {
    const counts = {}, valid = new Set();
    for (let row = 0; row < (pattern?.height || 0); row++) {
      for (let col = 0; col < (pattern?.width || 0); col++) {
        const code = pattern.cells?.[row]?.[col];
        if (code == null) continue;
        counts[code] = (counts[code] || 0) + 1;
        valid.add(`${row}:${col}`);
      }
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const done = Object.keys(progress).filter((key) => progress[key] && valid.has(key)).length;
    return { width: pattern?.width || 0, height: pattern?.height || 0, colors: Object.keys(counts).length, total, done, percent: total ? Math.round(done / total * 100) : 0 };
  }
  function recent(projects, preferredId) {
    const available = (projects || []).filter((p) => !p.deleted && !p.purged);
    return available.find((p) => p.id === preferredId) || available.slice().sort((a, b) => Date.parse(b.updatedAt || b.savedAt || b.createdAt || 0) - Date.parse(a.updatedAt || a.savedAt || a.createdAt || 0))[0] || null;
  }
  function sample() {
    // Original local example; use registry color matching in the host editor.
    const rows = ["....YYY......", "...YYYYY.....", "..YYBBBYY....", "..YYBBBYY....", "...YYYYY.....", "....YYY......", ".....G.......", "...GGG.......", ".....GGG.....", ".....G......."];
    const cells = Array.from({ length: 29 }, () => Array(29).fill(null));
    rows.forEach((row, y) => [...row].forEach((c, x) => { if (c !== ".") cells[y + 8][x + 8] = c; }));
    return { width: 29, height: 29, cells };
  }
  return Object.freeze({ summary, recent, sample });
});
