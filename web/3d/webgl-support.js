(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelWebGLSupport = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const SUPPORT_VERSION = "webgl-support-1";

  // WebGL2 能力检测：创建离屏 canvas 探测，不触碰现有渲染上下文。
  // 返回分级结果，供 3D 工作台决定进入完整渲染、降级提示或直接禁用。
  function detectWebGL2(documentRef) {
    const doc = documentRef || (typeof document !== "undefined" ? document : null);
    if (!doc || typeof doc.createElement !== "function") {
      return { supported: false, tier: "unavailable", reason: "no-document", maxTextureSize: 0, message: "当前环境不支持 3D 预览。" };
    }
    let canvas = null;
    try {
      canvas = doc.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
    } catch (_) {
      return { supported: false, tier: "unavailable", reason: "canvas-blocked", maxTextureSize: 0, message: "当前环境不支持 3D 预览。" };
    }
    let context = null;
    try {
      context = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false });
    } catch (_) {
      context = null;
    }
    if (!context) {
      return { supported: false, tier: "webgl1", reason: "no-webgl2", maxTextureSize: 0, message: "当前浏览器不支持 WebGL2，3D 成品预览不可用；图纸编辑与普通导出不受影响。" };
    }
    let maxTextureSize = 0;
    try {
      maxTextureSize = Number(context.getParameter(context.MAX_TEXTURE_SIZE)) || 0;
    } catch (_) {
      maxTextureSize = 0;
    }
    // 分级用于预览性能提示；4K 导出采用分块渲染，不要求 4096 纹理。
    let tier = "full";
    if (maxTextureSize && maxTextureSize < 4096) tier = "limited";
    if (maxTextureSize && maxTextureSize < 2048) tier = "weak";
    // 清理探测上下文，避免 Safari 记录过多 WebGL 实例。
    const lose = context.getExtension && context.getExtension("WEBGL_lose_context");
    if (lose && lose.loseContext) {
      try { lose.loseContext(); } catch (_) {}
    }
    context = null;
    canvas = null;
    return {
      supported: true,
      tier,
      reason: "",
      maxTextureSize,
      message: tier === "full"
        ? ""
        : tier === "limited"
          ? "当前设备 3D 预览能力有限；4K 导出会分块完成，可能需要更长时间。"
          : "当前设备 3D 能力较弱，大图纸预览可能卡顿，建议缩小图纸或使用普通导出。"
    };
  }

  // 上下文丢失/恢复的守卫：把浏览器事件转换为回调，返回卸载函数。
  // usage: watchContext(canvas, { onLost, onRestored })
  function watchContext(canvas, handlers) {
    if (!canvas || !canvas.addEventListener) return () => {};
    const settings = handlers || {};
    let restoreTimer = 0;
    const onLost = (event) => {
      if (event && event.preventDefault) event.preventDefault();
      if (typeof settings.onLost === "function") settings.onLost();
    };
    const onRestored = () => {
      clearTimeout(restoreTimer);
      restoreTimer = setTimeout(() => {
        if (typeof settings.onRestored === "function") settings.onRestored();
      }, 200);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return function unwatch() {
      clearTimeout(restoreTimer);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }

  // 内存压力观察：WebGL 渲染前查询 deviceMemory（Chrome）与内存压力事件（Safari 17+）。
  function memoryBudget() {
    const globalRef = typeof window !== "undefined" ? window : globalThis;
    const navigatorRef = globalRef && globalRef.navigator ? globalRef.navigator : null;
    // deviceMemory 为近似值（GB，向上取整到 0.25/0.5/1/2/4/8）；不足 4GB 时建议低精度。
    const deviceMemory = navigatorRef && Number(navigatorRef.deviceMemory) > 0 ? Number(navigatorRef.deviceMemory) : null;
    const hardwareConcurrency = navigatorRef && Number(navigatorRef.hardwareConcurrency) > 0 ? Number(navigatorRef.hardwareConcurrency) : null;
    let suggestLowDetail = false;
    if (deviceMemory != null && deviceMemory < 4) suggestLowDetail = true;
    if (hardwareConcurrency != null && hardwareConcurrency <= 3) suggestLowDetail = true;
    return { deviceMemory, hardwareConcurrency, suggestLowDetail };
  }

  return Object.freeze({ SUPPORT_VERSION, detectWebGL2, watchContext, memoryBudget });
});
