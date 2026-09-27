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
    dialog.innerHTML = `<div class="studio-dialog-head"><div><span class="studio-eyebrow">SMART SELECTION</span><h2>去除背景像素</h2><p>自动选择与边缘连通的背景；框选、套索、画笔或连通同色可增减选区。</p></div><button type="button" data-action="close" aria-label="关闭">×</button></div>
      <div class="studio-background-toolbar"><label>工具 <select data-role="tool"><option value="rect">框选</option><option value="brush">画笔</option><option value="lasso">套索</option><option value="connected">连通同色</option></select></label><label>操作 <select data-role="operation"><option value="add">增加选区</option><option value="subtract">减少选区</option></select></label><label>笔刷 <input data-role="size" type="range" min="1" max="12" value="2"></label><button type="button" data-action="redetect">重新识别</button><div class="studio-background-zoom"><button type="button" data-action="zoom-out" aria-label="缩小">−</button><button type="button" data-action="fit">适应</button><button type="button" data-action="zoom-in" aria-label="放大">＋</button><span data-role="zoom-label"></span></div></div>
      <div class="studio-background-canvas"><canvas data-role="canvas" aria-label="背景选区预览"></canvas></div><div class="studio-dialog-foot"><span data-role="status"></span><div><button type="button" data-action="cancel">取消</button><button type="button" data-action="apply" class="primary">清除选中像素</button></div></div>`;
    doc.body.appendChild(dialog);
    const canvas = dialog.querySelector("canvas"), ctx = canvas.getContext("2d");
    const viewport = dialog.querySelector(".studio-background-canvas");
    const zoomLabel = dialog.querySelector('[data-role="zoom-label"]');
    const status = dialog.querySelector('[data-role="status"]');
    let pattern = null, mask = null, code = null, active = null;
    let sourceCanvas = null, redrawFrame = 0, zoom = 1;

    function setZoom(value, anchor) {
      if (!pattern) return;
      const previousWidth = canvas.getBoundingClientRect().width || pattern.width;
      const previousHeight = canvas.getBoundingClientRect().height || pattern.height;
      const relativeX = anchor ? (anchor.x + viewport.scrollLeft) / previousWidth : .5;
      const relativeY = anchor ? (anchor.y + viewport.scrollTop) / previousHeight : .5;
      zoom = Math.max(.25, Math.min(40, value));
      canvas.style.width = `${Math.round(pattern.width * zoom)}px`;
      canvas.style.height = `${Math.round(pattern.height * zoom)}px`;
      zoomLabel.textContent = `${Math.round(zoom * 100)}% · 每格 ${zoom.toFixed(1)} px`;
      if (anchor) {
        viewport.scrollLeft = Math.max(0, relativeX * pattern.width * zoom - anchor.x);
        viewport.scrollTop = Math.max(0, relativeY * pattern.height * zoom - anchor.y);
      }
    }
    function fit() {
      if (!pattern) return;
      const availableWidth = Math.max(100, viewport.clientWidth - 24);
      const availableHeight = Math.max(100, viewport.clientHeight - 24);
      setZoom(Math.min(availableWidth / pattern.width, availableHeight / pattern.height));
      viewport.scrollLeft = 0; viewport.scrollTop = 0;
    }

    function point(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: Math.max(0, Math.min(pattern.width - 1, Math.floor((event.clientX - rect.left) / rect.width * pattern.width))), y: Math.max(0, Math.min(pattern.height - 1, Math.floor((event.clientY - rect.top) / rect.height * pattern.height))) };
    }
    function redraw() {
      if (!pattern) return;
      const width = pattern.width, height = pattern.height;
      const scale = canvas.width / width;
      ctx.drawImage(sourceCanvas, 0, 0);
      for (let row = 0; row < height; row += 1) for (let col = 0; col < width; col += 1) {
        if (mask[row * width + col]) { ctx.fillStyle = "rgba(20, 184, 166, .60)"; ctx.fillRect(col * scale, row * scale, Math.ceil(scale), Math.ceil(scale)); }
      }
      status.textContent = `识别背景 ${code || "无"} · 已选 ${engine.count(mask).toLocaleString()} 格 · 清除前可继续调整`;
    }
    function scheduleRedraw() {
      if (redrawFrame) return;
      redrawFrame = root.requestAnimationFrame(() => { redrawFrame = 0; redraw(); });
    }
    function buildSourceCanvas() {
      const width = pattern.width, height = pattern.height;
      canvas.width = Math.max(1, width * Math.max(2, Math.min(12, Math.floor(700 / width))));
      canvas.height = Math.max(1, height * canvas.width / width);
      sourceCanvas = doc.createElement("canvas");
      sourceCanvas.width = canvas.width; sourceCanvas.height = canvas.height;
      const source = sourceCanvas.getContext("2d");
      const scale = canvas.width / width;
      source.fillStyle = "#faf8f4"; source.fillRect(0, 0, canvas.width, canvas.height);
      for (let row = 0; row < height; row += 1) for (let col = 0; col < width; col += 1) {
        const cell = pattern.cells[row][col];
        if (!cell) continue;
        source.fillStyle = colorOf(cell) || "#b5c0ca";
        source.fillRect(col * scale, row * scale, Math.ceil(scale), Math.ceil(scale));
      }
    }
    function redetect() {
      const result = engine.detect(pattern.cells);
      mask = result.mask; code = result.code; redraw();
    }
    function open() {
      pattern = getPattern();
      if (!pattern || !pattern.cells) return false;
      buildSourceCanvas();
      redetect(); dialog.showModal(); fit(); return true;
    }
    function close() { if (dialog.open) dialog.close(); active = null; sourceCanvas = null; if (redrawFrame) root.cancelAnimationFrame(redrawFrame); redrawFrame = 0; }
    dialog.addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]")?.dataset.action;
      if (action === "close" || action === "cancel") close();
      if (action === "redetect" && pattern) redetect();
      if (action === "fit") fit();
      if (action === "zoom-in") setZoom(zoom * 1.25, { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 });
      if (action === "zoom-out") setZoom(zoom / 1.25, { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 });
      if (action === "apply" && pattern) {
        const selected = engine.count(mask);
        if (!selected) { status.textContent = "当前没有选中像素。"; return; }
        const changed = onApply(mask, pattern.width, pattern.height);
        if (changed) close(); else status.textContent = "没有可编辑的选中像素，请检查图层锁定状态。";
      }
    });
    viewport.addEventListener("wheel", (event) => {
      if (!pattern) return;
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      setZoom(zoom * (event.deltaY < 0 ? 1.2 : 1 / 1.2), { x: event.clientX - rect.left, y: event.clientY - rect.top });
    }, { passive: false });
    canvas.addEventListener("pointerdown", (event) => {
      if (!pattern) return;
      event.preventDefault(); canvas.setPointerCapture(event.pointerId);
      const tool = dialog.querySelector('[data-role="tool"]').value;
      active = { pointerId: event.pointerId, tool, start: point(event), points: [point(event)] };
      if (tool === "connected") {
        engine.connectedColor(mask, pattern.cells, active.start, dialog.querySelector('[data-role="operation"]').value === "add");
        active = null; redraw(); return;
      }
      if (tool === "brush") {
        const size = Number(dialog.querySelector('[data-role="size"]').value);
        engine.paint(mask, pattern.width, pattern.height, active.points, size - 1, dialog.querySelector('[data-role="operation"]').value === "add"); scheduleRedraw();
      }
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!active || active.pointerId !== event.pointerId) return;
      const next = point(event); active.points.push(next);
      if (active.tool === "brush") { engine.paint(mask, pattern.width, pattern.height, [next], Number(dialog.querySelector('[data-role="size"]').value) - 1, dialog.querySelector('[data-role="operation"]').value === "add"); scheduleRedraw(); }
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
