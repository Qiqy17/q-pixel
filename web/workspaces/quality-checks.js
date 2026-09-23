(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelQualityChecks = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const STAGE_CATEGORIES = Object.freeze({
    design: ["structure"],
    color: ["palette", "inventory"],
    make: ["structure", "inventory"],
    output: ["baseboard", "output"],
    version: ["version"]
  });

  function result(id, category, status, title, detail, action) {
    return { id, category, status, title, detail, action: action || null };
  }

  function run(snapshot) {
    const source = snapshot && typeof snapshot === "object" ? snapshot : {};
    const pattern = source.pattern || null;
    const width = Number(pattern && pattern.width || 0);
    const height = Number(pattern && pattern.height || 0);
    const usage = source.usage && typeof source.usage === "object" ? source.usage : {};
    const inventory = source.inventory && typeof source.inventory === "object" ? source.inventory : {};
    const colorCount = Object.keys(usage).filter((code) => Number(usage[code]) > 0).length;
    const total = Object.values(usage).reduce((sum, count) => sum + Math.max(0, Number(count) || 0), 0);
    const missing = Object.entries(usage).filter(([code, count]) => Number(inventory[code] || 0) < Number(count || 0));
    const boardCount = Math.max(0, Math.floor(Number(source.boardCount) || 0));
    const boardLabel = boardCount > 1 ? `需 ${boardCount} 块底板` : boardCount === 1 ? "单块底板可容纳" : "";
    const checks = [];

    checks.push(pattern
      ? result("pattern-ready", "structure", width > 300 || height > 300 ? "warning" : "pass", "图纸结构", `${width} × ${height} 格，共 ${total} 颗${width > 300 || height > 300 ? "；大图建议分区制作" : ""}`)
      : result("pattern-missing", "structure", "error", "尚未生成图纸", "导入图片或创建空白画布后再检查结构。", { type: "stage", stage: "design", label: "返回设计" }));

    checks.push(pattern
      ? result("palette-count", "palette", colorCount > 80 ? "warning" : "pass", "配色色数", `${colorCount} 个色号${colorCount > 80 ? "，制作成本较高，可在配色阶段精简" : ""}`, colorCount > 80 ? { type: "stage", stage: "color", label: "检查配色" } : null)
      : result("palette-wait", "palette", "warning", "等待图纸", "生成图纸后才能分析配色。"));

    checks.push(pattern
      ? result("inventory", "inventory", missing.length ? "warning" : "pass", "库存覆盖", missing.length ? `${missing.length} 个色号库存不足或尚未录入。` : "当前库存可覆盖图纸用量。", missing.length ? { type: "inventory-replan", label: "仅用库存配色" } : null)
      : result("inventory-wait", "inventory", "warning", "等待图纸", "生成图纸后才能核对库存。"));

    const modeLabel = source.baseboardModeLabel || source.baseboardMode || "";
    checks.push(result(
      "baseboard",
      "baseboard",
      source.baseboardMode || boardCount ? "pass" : "warning",
      "底板计划",
      boardCount
        ? boardLabel + (modeLabel ? `，当前为${modeLabel}。` : "。") + "拼制阶段可按底板分割推进，导出阶段可每板一页。"
        : source.baseboardMode ? `当前为${modeLabel}，尚未生成底板分割计划。` : "尚未选择底板显示方式。"
    ));

    checks.push(pattern
      ? result("output", "output", "pass", "输出准备", `图纸尺寸 ${width} × ${height}；导出设置已可用。`)
      : result("output-wait", "output", "error", "无法输出", "请先生成图纸。", { type: "stage", stage: "design", label: "返回设计" }));

    checks.push(result(
      "version",
      "version",
      source.hasUnsavedChanges ? "warning" : "pass",
      "版本状态",
      source.hasUnsavedChanges ? "当前有未保存修改。" : "当前修改已保存。",
      source.hasUnsavedChanges ? { type: "save", label: "立即保存" } : null
    ));

    return checks;
  }

  function forStage(checks, stage) {
    const categories = STAGE_CATEGORIES[stage] || STAGE_CATEGORIES.design;
    return (checks || []).filter((check) => categories.includes(check.category));
  }

  return Object.freeze({ STAGE_CATEGORIES, forStage, run });
});
