(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelInventoryEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const ENGINE_VERSION = "inventory-engine-1";

  function clampCount(value) {
    const count = Math.floor(Number(value) || 0);
    return count > 0 ? count : 0;
  }

  function normalizeUsage(usage) {
    const output = new Map();
    if (!usage) return output;
    if (Array.isArray(usage)) {
      usage.forEach((item) => {
        if (item && item.code) output.set(String(item.code), (output.get(String(item.code)) || 0) + clampCount(item.count));
      });
      return output;
    }
    if (typeof usage.forEach === "function" && typeof usage.get === "function") {
      usage.forEach((value, key) => output.set(String(key), clampCount(value)));
      return output;
    }
    if (typeof usage === "object") {
      Object.keys(usage).forEach((code) => {
        output.set(String(code), clampCount(usage[code]));
      });
    }
    return output;
  }

  function defaultColorDistance(a, b) {
    if (!a || !b) return Infinity;
    const dr = a.r - b.r, dg = a.g - b.g, db = a.b - b.b;
    return Math.sqrt(.299 * dr * dr + .587 * dg * dg + .114 * db * db);
  }

  function create(options) {
    const settings = options || {};
    const colorOf = typeof settings.colorOf === "function" ? settings.colorOf : () => null;
    const colorDistance = typeof settings.colorDistance === "function" ? settings.colorDistance : defaultColorDistance;

    function usageOfCells(cells) {
      const usage = new Map();
      if (!Array.isArray(cells)) return usage;
      cells.forEach((row) => {
        if (!Array.isArray(row)) return;
        row.forEach((code) => {
          if (!code) return;
          usage.set(String(code), (usage.get(String(code)) || 0) + 1);
        });
      });
      return usage;
    }

    // 库存摘要：每色需求、可用量、缺口与覆盖状态。
    function summarize(usage, inventory, summaryOptions) {
      const reserved = normalizeUsage((summaryOptions && summaryOptions.reserved) || {});
      const stockMap = normalizeUsage(inventory);
      const colors = [];
      normalizeUsage(usage).forEach((need, code) => {
        const stock = clampCount(stockMap.get(code));
        const held = clampCount(reserved.get(code));
        const available = Math.max(0, stock - held);
        const shortage = Math.max(0, need - available);
        colors.push({ code, need, stock, reserved: held, available, shortage, covered: shortage === 0 });
      });
      colors.sort((a, b) => b.shortage - a.shortage || b.need - a.need || a.code.localeCompare(b.code));
      return Object.freeze({
        version: ENGINE_VERSION,
        colors: Object.freeze(colors),
        totalNeed: colors.reduce((sum, item) => sum + item.need, 0),
        totalShortage: colors.reduce((sum, item) => sum + item.shortage, 0),
        missingCount: colors.filter((item) => !item.covered).length
      });
    }

    // 替代色候选：按色差升序，且替代后库存必须真正可覆盖新增用量。
    function substitutionOptions(code, usage, inventory, substitutionOptions) {
      const settings = substitutionOptions || {};
      const limit = clampCount(settings.limit || 5);
      const maxDistance = Number.isFinite(Number(settings.maxDistance)) ? Number(settings.maxDistance) : Infinity;
      const target = colorOf(code);
      if (!target || !target.rgb) return [];
      const usageMap = normalizeUsage(usage);
      const stockMap = normalizeUsage(inventory);
      const need = usageMap.get(String(code)) || 0;
      const surplus = new Map();
      usageMap.forEach((count, usageCode) => {
        const stock = clampCount(stockMap.get(usageCode));
        surplus.set(usageCode, stock - count);
      });
      const candidates = [];
      stockMap.forEach((stock, candidateCode) => {
        if (candidateCode === String(code)) return;
        const candidateColor = colorOf(candidateCode);
        if (!candidateColor || !candidateColor.rgb) return;
        const distance = colorDistance(target.rgb, candidateColor.rgb);
        if (distance > maxDistance) return;
        // 图纸内的色按余量计算，图纸外的色全部库存可用。
        const freeStock = surplus.has(candidateCode) ? surplus.get(candidateCode) : clampCount(stock);
        if (freeStock < need && !settings.allowPartial) return;
        candidates.push({
          toCode: candidateCode,
          deltaE: Math.round(distance * 100) / 100,
          affectedCount: need,
          shortageAfter: freeStock >= need ? 0 : need - freeStock,
          toRgb: candidateColor.rgb
        });
      });
      candidates.sort((a, b) => a.deltaE - b.deltaE || a.toCode.localeCompare(b.toCode));
      return candidates.slice(0, limit);
    }

    // 仅使用库存颜色重新配色：锁定色不替换；短缺色贪心分配到色差最近且有余量的色号。
    function planInventoryReduction(cells, inventory, planOptions) {
      const settings = planOptions || {};
      const locked = new Set((Array.isArray(settings.lockedCodes) ? settings.lockedCodes : []).map(String));
      const maxDistance = Number.isFinite(Number(settings.maxDistance)) ? Number(settings.maxDistance) : Infinity;
      if (!Array.isArray(cells)) return { version: ENGINE_VERSION, cells: [], changes: [], unresolved: [], applied: false };
      const usage = usageOfCells(cells);
      const stockMap = normalizeUsage(inventory);
      const summary = summarize(usage, stockMap, settings);
      const shortages = summary.colors.filter((item) => !item.covered);
      if (!shortages.length) return { version: ENGINE_VERSION, cells: cells.map((row) => (Array.isArray(row) ? row.slice() : row)), changes: [], unresolved: [], applied: true };

      // 各色可挪用余量：库存减去自身需求。
      const freeStock = new Map();
      usage.forEach((need, code) => {
        const stock = clampCount(stockMap.get(code));
        freeStock.set(code, stock - need);
      });

      const assignments = new Map();
      const unresolved = [];
      const pairs = [];
      shortages.forEach((item) => {
        const fromColor = colorOf(item.code);
        if (!fromColor || !fromColor.rgb || locked.has(item.code)) {
          unresolved.push({ code: item.code, need: item.need, shortage: item.shortage, locked: locked.has(item.code) });
          return;
        }
        usage.forEach((_, candidateCode) => {
          if (candidateCode === item.code) return;
          if ((freeStock.get(candidateCode) || 0) < item.shortage) return;
          if (assignments.has(candidateCode)) return;
          const candidateColor = colorOf(candidateCode);
          if (!candidateColor || !candidateColor.rgb) return;
          const distance = colorDistance(fromColor.rgb, candidateColor.rgb);
          if (distance > maxDistance) return;
          pairs.push({ from: item.code, to: candidateCode, count: item.shortage, deltaE: Math.round(distance * 100) / 100 });
        });
        // 未被图纸使用但库存充足的色号也可作为替代候选。
        stockMap.forEach((stock, candidateCode) => {
          if (usage.has(candidateCode) || candidateCode === item.code) return;
          if (assignments.has(candidateCode)) return;
          if (clampCount(stock) < item.shortage) return;
          const candidateColor = colorOf(candidateCode);
          if (!candidateColor || !candidateColor.rgb) return;
          const distance = colorDistance(fromColor.rgb, candidateColor.rgb);
          if (distance > maxDistance) return;
          pairs.push({ from: item.code, to: candidateCode, count: item.shortage, deltaE: Math.round(distance * 100) / 100 });
        });
      });
      pairs.sort((a, b) => a.deltaE - b.deltaE || a.from.localeCompare(b.from));

      const changes = [];
      pairs.forEach((pair) => {
        if (assignments.has(pair.from)) return;
        const need = shortages.find((item) => item.code === pair.from);
        const required = need ? need.shortage : 0;
        if (!required) return;
        const available = (freeStock.get(pair.to) || 0) + (usage.has(pair.to) ? 0 : clampCount(stockMap.get(pair.to) || 0));
        if (available < required) return;
        assignments.set(pair.from, pair.to);
        changes.push({ from: pair.from, to: pair.to, count: required, deltaE: pair.deltaE });
        freeStock.set(pair.to, available - required);
      });
      shortages.forEach((item) => {
        if (!assignments.has(item.code) && !unresolved.some((entry) => entry.code === item.code)) {
          unresolved.push({ code: item.code, need: item.need, shortage: item.shortage, locked: locked.has(item.code) });
        }
      });

      if (!changes.length) return { version: ENGINE_VERSION, cells: cells.map((row) => (Array.isArray(row) ? row.slice() : row)), changes: [], unresolved, applied: false };

      // 按变更数量限量替换：只有缺口部分换到替代色，保留色号的原格不动。
      const nextCells = cells.map((row) => (Array.isArray(row) ? row.slice() : row));
      changes.forEach((change) => {
        let remaining = change.count;
        for (let row = 0; row < nextCells.length && remaining > 0; row += 1) {
          if (!Array.isArray(nextCells[row])) continue;
          for (let col = 0; col < nextCells[row].length && remaining > 0; col += 1) {
            if (nextCells[row][col] === change.from) { nextCells[row][col] = change.to; remaining -= 1; }
          }
        }
      });
      return { version: ENGINE_VERSION, cells: nextCells, changes, unresolved, applied: true };
    }

    // 库存扣减：预览、应用与撤回，全部返回新对象不修改输入。
    function decrementPreview(usage, inventory) {
      const usageMap = normalizeUsage(usage);
      const preview = [];
      usageMap.forEach((count, code) => {
        const before = clampCount((inventory || {})[code]);
        preview.push({ code, before, delta: -Math.min(count, before), after: Math.max(0, before - count) });
      });
      return Object.freeze(preview);
    }

    function applyDecrement(inventory, usage, meta) {
      const usageMap = normalizeUsage(usage);
      const next = Object.assign({}, inventory || {});
      const items = [];
      usageMap.forEach((count, code) => {
        const before = clampCount(next[code]);
        const delta = -Math.min(count, before);
        next[code] = Math.max(0, before - count);
        items.push({ code, before, delta });
      });
      const record = {
        id: `inventory-decrement-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
        at: new Date().toISOString(),
        items,
        meta: meta ? JSON.parse(JSON.stringify(meta)) : null
      };
      return { inventory: next, record };
    }

    function undoDecrement(inventory, record) {
      if (!record || !Array.isArray(record.items)) return Object.assign({}, inventory || {});
      const next = Object.assign({}, inventory || {});
      record.items.forEach((item) => {
        // delta 为负数（扣减量），直接加回，不能经 clampCount 归零。
        const before = Number(next[item.code]);
        next[item.code] = Math.max(0, (Number.isFinite(before) ? before : 0) - Number(item.delta || 0));
      });
      return next;
    }

    return Object.freeze({ ENGINE_VERSION, usageOfCells, summarize, substitutionOptions, planInventoryReduction, decrementPreview, applyDecrement, undoDecrement });
  }

  return Object.freeze({ ENGINE_VERSION, create });
});
