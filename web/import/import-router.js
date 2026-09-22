(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelImportRouter = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const ENTRIES = Object.freeze([
    { id: "photo", title: "照片转图纸", description: "自动分析照片或插画，生成可编辑拼豆图纸。", accepts: "PNG / JPG / WebP", result: "新建临时导入会话，确认后才写入画布", needsFile: true },
    { id: "rebuild", title: "已有图纸重建", description: "校正拍摄角度和网格，恢复每格颜色与空格。", accepts: "图纸截图、扫描件或拍照", result: "生成重建副本、识别报告和低置信度清单", needsFile: true },
    { id: "trace", title: "参考图描绘", description: "把参考图放在网格下方，手动描绘和取色。", accepts: "PNG / JPG / WebP", result: "创建空白图纸并保留可调透明度参考图", needsFile: true },
    { id: "blank", title: "空白项目", description: "直接选择尺寸，从零开始绘制。", accepts: "无需文件", result: "立即创建新的空白图纸", needsFile: false }
  ]);

  function getEntry(id) {
    return ENTRIES.find((entry) => entry.id === id) || null;
  }

  function createSession(entryId, now) {
    const entry = getEntry(entryId);
    if (!entry) return null;
    return {
      id: `entry-${typeof now === "function" ? now() : Date.now()}`,
      entryId: entry.id,
      status: entry.needsFile ? "awaiting-file" : "ready",
      createdAt: new Date(typeof now === "function" ? now() : Date.now()).toISOString(),
      committed: false
    };
  }

  return Object.freeze({ ENTRIES, createSession, getEntry });
});
