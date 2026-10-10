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

  function inspectPattern(pattern, knownCodes) {
    if (!pattern || !Number.isInteger(pattern.width) || !Number.isInteger(pattern.height) || pattern.width < 1 || pattern.height < 1 || !Array.isArray(pattern.cells) || pattern.cells.length !== pattern.height || pattern.cells.some(row => !Array.isArray(row) || row.length !== pattern.width)) return { valid: false };
    const usage = Object.create(null), unknown = new Set(), known = knownCodes ? new Set(knownCodes) : null;
    let total = 0, isolated = 0;
    for (let row = 0; row < pattern.height; row++) for (let col = 0; col < pattern.width; col++) {
      const code = pattern.cells[row][col];
      if (code === null) continue;
      if (typeof code !== "string" || !code) return { valid: false };
      total++; usage[code] = (usage[code] || 0) + 1;
      if (known && !known.has(code)) unknown.add(code);
      if (!((row>0 && pattern.cells[row-1][col]===code) || (row+1<pattern.height && pattern.cells[row+1][col]===code) || (col>0 && pattern.cells[row][col-1]===code) || (col+1<pattern.width && pattern.cells[row][col+1]===code))) isolated++;
    }
    return { valid: true, usage, total, isolated, unknown: [...unknown] };
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
    const inventorySet = Object.keys(inventory).length > 0;
    const boardCount = Math.max(0, Math.floor(Number(source.boardCount) || 0));
    const boardLabel = boardCount > 1 ? `需 ${boardCount} 块底板` : boardCount === 1 ? "单块底板可容纳" : "";
    const checks = [];
    const inspected = pattern && Array.isArray(pattern.cells) ? inspectPattern(pattern, source.validColorCodes) : null;

    checks.push(pattern
      ? result("pattern-ready", "structure", width > 300 || height > 300 ? "warning" : "pass", "图纸结构", `${width} × ${height} 格，共 ${total} 颗${width > 300 || height > 300 ? "；大图建议分区制作" : ""}`)
      : result("pattern-missing", "structure", "error", "尚未生成图纸", "导入图片或创建空白画布后再检查结构。", { type: "stage", stage: "design", label: "返回设计" }));

    if (inspected) {
      const countsMatch = inspected.valid && [...new Set([...Object.keys(usage), ...Object.keys(inspected.usage)])].every(code => Number(usage[code] || 0) === Number(inspected.usage[code] || 0));
      checks.push(result("pattern-integrity", "structure", !inspected.valid || !countsMatch ? "error" : "pass", "格子与用量一致性", !inspected.valid ? "格子行列或色号数据不完整，请保留源文件并重新导入。" : !countsMatch ? "备料用量与格子不一致，请重新核对图纸，暂不要按此清单采购。" : `${inspected.total} 个有效格与备料用量一致。`));
      if (inspected.valid) {
        checks.push(result("unknown-colors", "structure", inspected.unknown.length ? "warning" : "pass", "色号来源", inspected.unknown.length ? `当前色库未识别：${inspected.unknown.join("、")}。请核对品牌与色号，图纸未自动改色。` : "图纸色号均在当前色库中。"));
        const manyFragments = inspected.isolated >= 8 && inspected.isolated / Math.max(1, inspected.total) >= .15;
        checks.push(result("isolated-cells", "structure", manyFragments ? "warning" : "pass", "碎色检查", `${inspected.isolated} 格没有上下左右相邻同色；${manyFragments ? "建议放大核对是否为噪点或必要细节" : "可按设计保留"}。不会自动删除或改色。`));
      }
    }

    checks.push(pattern
      ? result("palette-count", "palette", colorCount > 80 ? "warning" : "pass", "配色色数", `${colorCount} 个色号${colorCount > 80 ? "，制作成本较高，可在配色阶段精简" : ""}`, colorCount > 80 ? { type: "stage", stage: "color", label: "检查配色" } : null)
      : result("palette-wait", "palette", "warning", "等待图纸", "生成图纸后才能分析配色。"));

    checks.push(pattern
      ? result("inventory", "inventory", inventorySet && missing.length ? "warning" : "pass", inventorySet ? "库存覆盖" : "库存尚未设置（可选）", !inventorySet ? "可直接拼制；录入库存后再核对实际缺口。" : missing.length ? `${missing.length} 个色号库存不足或尚未录入，请查看完整备料清单。` : "当前库存可覆盖图纸用量。", null)
      : result("inventory-wait", "inventory", "warning", "等待图纸", "生成图纸后才能核对库存。"));

    const modeLabel = source.baseboardModeLabel || source.baseboardMode || "";
    checks.push(result(
      "baseboard",
      "baseboard",
      source.baseboardMode || boardCount ? "pass" : "warning",
      "底板计划",
      boardCount
        ? (source.boardPlanEstimated ? "预计" : "") + boardLabel + (source.boardSpecLabel ? `（${source.boardSpecLabel}）` : "") + (modeLabel ? `，当前为${modeLabel}。` : "。") + "拼制前核对实际底板与分割方向；逐板导出可每板一页。"
        : source.baseboardMode ? `当前为${modeLabel}，尚未生成底板分割计划。` : "尚未选择底板显示方式。"
    ));

    checks.push(pattern
      ? result("output", "output", "warning", "打印比例与方向", `图纸尺寸 ${width} × ${height} 格；${source.exportSettings?.exportMirror ? "已开启镜像，请核对正反方向。" : "未开启镜像。"}PDF 会适配页面，不保证 1:1 底板定位；请先试印并测量 10 格间距，再打印全套。`)
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

  return Object.freeze({ STAGE_CATEGORIES, forStage, run, inspectPattern });
});
