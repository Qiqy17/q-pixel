(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelBackgroundTool = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  function create(options) {
    const { engine, getPattern, colorOf, onApply } = options;
    const doc = options.document || root.document;
    const dialog = doc.createElement("dialog");
    dialog.className = "studio-background-dialog";
    dialog.innerHTML = `<div class="studio-dialog-head"><div><span class="studio-eyebrow">SMART SELECTION</span><h2>去除背景像素</h2><p>自动选择与边缘连通的背景；框选、套索或画笔可增减选区。</p></div><button type="button" data-action="close" aria-label="关闭">×</button></div>
      <div class="studio-background-toolbar"><label>工具 <select data-role="tool"><option value="rect">框选</option><option value="brush">画笔</option><option value="lasso">套索</option></select></label><label>操作 <select data-role="operation"><option value="add">增加选区</option><option value="subtract">减少选区</option></select></label><label>笔刷 <input data-role="size" type="range" min="1" max="12" value="2"></label><button type="button" data-action="redetect">重新识别</button></div>
      <div class="studio-background-canvas"><canvas data-role="canvas" aria-label="背景选区预览"></canvas></div><div class="studio-dialog-foot"><span data-role="status"></span><div><button type="button" data-action="cancel">取消</button><button type="button" data-action="apply" class="primary">清除选中像素</button></div></div>`;
    doc.body.appendChild(dialog);
    const canvas = dialog.querySelector("canvas"), ctx = canvas.getContext("2d");
    const status = dialog.querySelector('[data-role="status"]');
    let pattern = null, mask = null, code = null, active = null;

    function point(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: Math.max(0, Math.min(pattern.width - 1, Math.floor((event.clientX - rect.left) / rect.width * pattern.width))), y: Math.max(0, Math.min(pattern.height - 1, Math.floor((event.clientY - rect.top) / rect.height * pattern.height))) };
    }
    function redraw() {
      if (!pattern) return;
      const width = pattern.width, height = pattern.height;
      canvas.width = Math.max(1, width * Math.max(2, Math.min(12, Math.floor(700 / width))));
      canvas.height = Math.max(1, height * canvas.width / width);
      const scale = canvas.width / width;
      ctx.fillStyle = "#faf8f4"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let row = 0; row < height; row += 1) for (let col = 0; col < width; col += 1) {
        const cell = pattern.cells[row][col];
        if (!cell) continue;
        ctx.fillStyle = colorOf(cell) || "#b5c0ca";
        ctx.fillRect(col * scale, row * scale, Math.ceil(scale), Math.ceil(scale));
        if (mask[row * width + col]) { ctx.fillStyle = "rgba(20, 184, 166, .60)"; ctx.fillRect(col * scale, row * scale, Math.ceil(scale), Math.ceil(scale)); }
      }
      status.textContent = `识别背景 ${code || "无"} · 已选 ${engine.count(mask).toLocaleString()} 格 · 清除前可继续调整`;
    }
    function redetect() {
      const result = engine.detect(pattern.cells);
      mask = result.mask; code = result.code; redraw();
    }
    function open() {
      pattern = getPattern();
      if (!pattern || !pattern.cells) return false;
      redetect(); dialog.showModal(); return true;
    }
    function close() { if (dialog.open) dialog.close(); active = null; }
    dialog.addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]")?.dataset.action;
      if (action === "close" || action === "cancel") close();
      if (action === "redetect" && pattern) redetect();
      if (action === "apply" && pattern) {
        const selected = engine.count(mask);
        if (!selected) { status.textContent = "当前没有选中像素。"; return; }
        const changed = onApply(mask, pattern.width, pattern.height);
        if (changed) close(); else status.textContent = "没有可编辑的选中像素，请检查图层锁定状态。";
      }
    });
    canvas.addEventListener("pointerdown", (event) => {
      if (!pattern) return;
      event.preventDefault(); canvas.setPointerCapture(event.pointerId);
      const tool = dialog.querySelector('[data-role="tool"]').value;
      active = { pointerId: event.pointerId, tool, start: point(event), points: [point(event)] };
      if (tool === "brush") {
        const size = Number(dialog.querySelector('[data-role="size"]').value);
        engine.paint(mask, pattern.width, pattern.height, active.points, size - 1, dialog.querySelector('[data-role="operation"]').value === "add"); redraw();
      }
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!active || active.pointerId !== event.pointerId) return;
      const next = point(event); active.points.push(next);
      if (active.tool === "brush") { engine.paint(mask, pattern.width, pattern.height, [next], Number(dialog.querySelector('[data-role="size"]').value) - 1, dialog.querySelector('[data-role="operation"]').value === "add"); redraw(); }
    });
    function finish(event) {
      if (!active || active.pointerId !== event.pointerId) return;
      const selected = dialog.querySelector('[data-role="operation"]').value === "add";
      if (active.tool === "rect") engine.rectangle(mask, pattern.width, pattern.height, active.start, point(event), selected);
      if (active.tool === "lasso") engine.polygon(mask, pattern.width, pattern.height, active.points, selected);
      active = null; redraw();
    }
    canvas.addEventListener("pointerup", finish);
    canvas.addEventListener("pointercancel", () => { active = null; });
    return Object.freeze({ open, close });
  }
  return Object.freeze({ create });
});
