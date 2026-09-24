"use strict";
const assert = require("node:assert/strict");
const registry = require("../web/color/palette-registry.js");
const inventoryModule = require("../web/color/inventory-engine.js");

const mard = registry.defaultPalette();
assert.equal(mard.id, "mard-221");
assert.equal(mard.colorCount, 221);
assert.equal(mard.brand, "MARD");
assert.equal(mard.beadDiameterMm, 5);
assert.equal(mard.calibrated, false);
assert.equal(mard.specialColors.length, 1);
assert.equal(mard.colorOf("T1").opticalClass, "clear");
assert.equal(mard.colorOf("H1").opticalClass, "opaque");
assert.equal(mard.allColors.length, 222);
assert.ok(mard.hasCode("A1"));
assert.ok(!mard.hasCode("ZZ9"));
const a1 = mard.colorOf("A1");
assert.equal(a1.hex, "#FAF5CD");
assert.deepEqual(a1.rgb, { r: 250, g: 245, b: 205 });

// 注册自定义品牌并保持隔离。
const custom = registry.register({ id: "test-brand", brand: "测试", colors: [["T1", "米白", "#FAF5CD"], ["T2", "深灰", "#404040"]] });
assert.equal(custom.colorCount, 2);
assert.equal(registry.get("test-brand").colorOf("T2").hex, "#404040");
assert.equal(registry.defaultPalette().id, "mard-221");

// 库存引擎：注入 MARD 色板与色差函数。
function hexToRgb(hex) {
  return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
}
const inventoryEngine = inventoryModule.create({
  colorOf: (code) => {
    const color = mard.colorOf(code);
    return color ? { code: color.code, rgb: hexToRgb(color.hex) } : null;
  },
  colorDistance: (a, b) => Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2)
});

// 摘要：缺口、预留与覆盖。
const usage = { "A1": 10, "A2": 4, "A3": 6 };
const stock = { "A1": 8, "A2": 10, "A4": 50 };
const summary = inventoryEngine.summarize(usage, stock, { reserved: { "A2": 3 } });
assert.equal(summary.totalNeed, 20);
assert.equal(summary.missingCount, 2);
const a1Entry = summary.colors.find((item) => item.code === "A1");
assert.equal(a1Entry.shortage, 2);
assert.equal(a1Entry.covered, false);
const a2Entry = summary.colors.find((item) => item.code === "A2");
assert.equal(a2Entry.available, 7);
assert.equal(a2Entry.covered, true);

// 替代候选：按色差升序，A1 最近色应排在前面且库存可覆盖。
const subs = inventoryEngine.substitutionOptions("A1", usage, stock, { limit: 3 });
assert.ok(subs.length >= 1);
assert.ok(subs[0].deltaE <= subs[subs.length - 1].deltaE);
assert.equal(subs[0].toCode, "A4");
assert.equal(subs[0].affectedCount, 10);

// 库存约束配色：A1 缺 2 颗换到色差最近的 A2，A3 缺 6 颗在 A2 余量不足时改用 A4。
const cells = [
  ["A1", "A1", "A1", "A1", "A2"],
  ["A1", "A1", "A1", "A1", "A1"],
  ["A3", "A3", "A3", "A3", "A3"],
  ["A3", "A1", "A2", "A2", "A2"]
];
const plan = inventoryEngine.planInventoryReduction(cells, stock, {});
assert.equal(plan.applied, true);
assert.equal(plan.cells.length, cells.length);
assert.equal(plan.changes.length, 2);
const a1Change = plan.changes.find((item) => item.from === "A1");
assert.equal(a1Change.to, "A2");
assert.equal(a1Change.count, 2);
const a3Change = plan.changes.find((item) => item.from === "A3");
assert.equal(a3Change.to, "A4");
assert.equal(a3Change.count, 6);
assert.deepEqual(plan.unresolved, []);
assert.equal(plan.cells.flat().filter((code) => code === "A1").length, 8);
assert.equal(plan.cells.flat().filter((code) => code === "A4").length, 6);
assert.equal(plan.cells.flat().filter((code) => code === "A3").length, 0);

// 锁定色不替换，进入未解决清单；未锁定色照常获得替代方案。
const lockedPlan = inventoryEngine.planInventoryReduction(cells, stock, { lockedCodes: ["A1"] });
assert.equal(lockedPlan.applied, true);
assert.ok(lockedPlan.unresolved.some((item) => item.code === "A1" && item.locked));
assert.equal(lockedPlan.cells.flat().filter((code) => code === "A1").length, 10);
assert.equal(lockedPlan.cells.flat().filter((code) => code === "A3").length, 0);

// 库存充足时不产生变更。
const richPlan = inventoryEngine.planInventoryReduction(cells, { "A1": 50, "A2": 50, "A3": 50 }, {});
assert.equal(richPlan.applied, true);
assert.equal(richPlan.changes.length, 0);
assert.deepEqual(richPlan.cells.flat(), cells.flat());

// 库存扣减：预览、应用、撤回闭环，输入不被修改。
const consumption = { "A1": 3, "A2": 2 };
const preview = inventoryEngine.decrementPreview(consumption, stock);
assert.deepEqual(preview.find((item) => item.code === "A1"), { code: "A1", before: 8, delta: -3, after: 5 });
const applied = inventoryEngine.applyDecrement(stock, consumption, { source: "test" });
assert.equal(applied.inventory["A1"], 5);
assert.equal(applied.inventory["A2"], 8);
assert.equal(stock["A1"], 8);
assert.ok(applied.record.id.startsWith("inventory-decrement-"));
assert.equal(applied.record.meta.source, "test");
const undone = inventoryEngine.undoDecrement(applied.inventory, applied.record);
assert.equal(undone["A1"], 8);
assert.equal(undone["A2"], 10);
console.log("inventory-engine tests: PASS");
