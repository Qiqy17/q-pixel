(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelFinishWorkbench = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const TEMPLATE = [
    '<div class="finish-top">',
    '  <div><span class="studio-eyebrow">Q PIXEL / PREVIEW</span><h2>预览工作台</h2><div class="finish-tabs" role="tablist" aria-label="预览模式"><button type="button" data-action="tab-3d" role="tab" aria-selected="true">成品 3D</button><button type="button" data-action="tab-flat" role="tab" aria-selected="false">平面展示图</button></div><p data-role="notice" hidden></p></div>',
    '  <button type="button" data-action="close" aria-label="关闭">×</button>',
    '</div>',
    '<div class="finish-body">',
    '  <main class="finish-stage" data-view="3d"><canvas data-role="scene-background" aria-hidden="true"></canvas><canvas data-role="canvas" aria-label="3D 成品画布"></canvas><canvas data-role="overlay" aria-hidden="true"></canvas><div class="finish-flat" data-role="flat" hidden></div><canvas data-role="flat-editor" aria-label="平面图纸编辑画布" hidden></canvas>',
    '    <div class="finish-stage-toolbar" role="group" aria-label="预览画布操作"><button type="button" data-action="mode-view" aria-pressed="true">观察视角</button><button type="button" data-action="mode-edit" aria-pressed="false">编辑图纸</button><button type="button" data-action="reset-view">重置视角</button><div class="finish-stage-tools" data-role="quick-tools" hidden><button type="button" data-tool="brush">画笔</button><button type="button" data-tool="eraser">橡皮</button><button type="button" data-tool="picker">取色</button></div><span data-role="mode-hint">拖动旋转 · 滚轮或双指缩放</span></div>',
    '    <div class="finish-flat-zoom" data-role="flat-edit-zoom" hidden><button type="button" data-action="flat-zoom-out" aria-label="缩小图纸">－</button><button type="button" data-action="flat-zoom-fit">适应</button><button type="button" data-action="flat-zoom-in" aria-label="放大图纸">＋</button></div>',
    '    <div class="finish-edit-display" data-role="edit-display" hidden><strong data-role="canvas-size">画布尺寸</strong><span data-role="active-tool">当前工具：画笔</span><label><input data-role="quick-show-codes" type="checkbox">色号</label><label><input data-role="quick-show-grid" type="checkbox">网格</label><label><input data-role="quick-show-guides" type="checkbox">辅助线</label></div>',
    '    <div class="finish-editor-rails" data-role="editor-rails" hidden><div data-role="rail-main"></div><div data-role="rail-extra"></div></div>',
    '    <span class="finish-watermark" data-role="watermark">参考模拟 · 未实物标定</span>',
    '    <div class="finish-compare" data-role="compare" hidden><img alt="保存的对比视角"><button type="button" data-action="hide-compare">关闭对比</button></div></main>',
    '  <aside class="finish-controls"><details class="finish-control-group finish-presets" data-role="preset-group"><summary>烫法预设 · <span data-role="profile-label">未烫</span></summary><div data-role="profiles"></div><p data-role="profile-description">参考模型</p></details><strong>视角与材质</strong>',
    '    <div class="finish-view-buttons"><button type="button" data-action="angle">斜侧</button><button type="button" data-action="front">正面</button><button type="button" data-action="back">背面</button></div>',
    '    <div class="finish-view-buttons"><button type="button" data-action="rotate-left" title="左转">↶</button><button type="button" data-action="rotate-right" title="右转">↷</button><button type="button" data-action="tilt-up" title="抬高">↑</button><button type="button" data-action="tilt-down" title="降低">↓</button><button type="button" data-action="zoom-in" title="放大">＋</button><button type="button" data-action="zoom-out" title="缩小">－</button></div>',
    '    <label>H1 白色不透明度 <output data-role="h1-opacity-label">0%</output><input data-role="h1-opacity" type="range" min="0" max="100" step="1" value="0"></label>',
    '    <details class="finish-control-group" data-role="edit-group"><summary>图纸编辑</summary><p>工具与主画布共用；选择“编辑图纸”后落笔。</p><div data-role="editor-actions"><button type="button" data-action="undo">撤销</button><button type="button" data-action="redo">重做</button></div><div data-role="color-strip"></div></details>',
    '    <details class="finish-control-group" data-role="tool-settings"><summary>工具参数与色板</summary><div data-role="tool-options"></div></details>',
    '    <details class="finish-control-group" data-role="layer-group"><summary>图层</summary><div data-role="layers"></div></details>',
    '    <details class="finish-control-group finish-flat-controls" data-role="flat-controls-group"><summary>平面构图</summary><div data-role="flat-controls"></div></details>',
    '    <details class="finish-control-group" open><summary>熨烫质感</summary><label>纹理粗糙程度 <output data-value="textureRoughness"></output><input data-tuning="textureRoughness" type="range" min="0" max="100"></label><label>纹理透明度 <output data-value="textureOpacity"></output><input data-tuning="textureOpacity" type="range" min="0" max="100"></label><label>融边程度 <output data-value="meltEdge"></output><input data-tuning="meltEdge" type="range" min="0" max="100"></label><button type="button" data-action="reset-tuning">恢复当前烫法默认</button></details>',
    '    <details class="finish-control-group"><summary>图纸与标记</summary><label><input data-role="show-codes" type="checkbox">显示色号</label><label><input data-role="show-grid" type="checkbox">显示网格</label><label><input data-role="show-guides" type="checkbox">显示辅助线</label><label>色号透明度 <output data-value="codeOpacity"></output><input data-role="code-opacity" type="range" min="0" max="100"></label><label>色号大小 <output data-value="codeSize"></output><input data-role="code-size" type="range" min="0" max="100"></label><p>缩放过小时会暂时隐藏细字与网格，放大后恢复。隐藏辅助线不会删除它们。</p></details>',
    '    <label>曝光<input data-role="exposure" type="range" min="50" max="180" value="100"></label>',
    '    <label>观察光照强度<input data-role="light-intensity" type="range" min="50" max="160" value="100"></label>',
    '    <label>观察光色<select data-role="light-temperature"><option value="neutral">中性对照光</option><option value="warm">暖光</option><option value="cool">冷光</option></select></label>',
    '    <p class="finish-light-note">光照只改变预览，不修改图纸色号；当前未做实物色差标定。</p>',
    '    <details class="finish-control-group" open><summary>布景与光影</summary><label>光影效果<select data-role="light-effect"></select></label><label>背景材质<select data-role="background-material"></select></label><label>背景颜色<input data-role="background-color" type="color"></label><label>背景透明度 <output data-role="background-alpha-label">100%</output><input data-role="background-alpha" type="range" min="0" max="100"></label><button type="button" data-action="background-image">选择背景图</button><p>两种预览共用背景与光影效果；3D 曝光和光照强度可单独微调。</p></details>',
    '    <details class="finish-control-group"><summary>3D 图纸背板</summary><label>背板样式<select data-role="board-mode"><option value="transparent">透明</option><option value="color">纯色</option><option value="image">背景图</option></select></label><label>背板颜色<input data-role="board-color" type="color"></label><label>背板透明度 <output data-role="board-alpha-label">100%</output><input data-role="board-alpha" type="range" min="0" max="100"></label><button type="button" data-action="board-image">选择背板图</button><button type="button" data-action="clear-board-image">清除背板图</button><span data-role="board-image-name">未选择</span><input data-role="board-image-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden><p>只作用于图纸矩形区域；透明时透出外层布景。</p></details>',
    '    <div class="finish-facts"><span data-role="facts">等待载入</span><span data-role="picked">单击编辑 · 长按高亮同色</span></div>',
    '    <button type="button" data-action="snapshot">保存对比快照</button>',
    '    <button type="button" data-action="compare">分屏比较</button>',
    '    <hr>',
    '    <button type="button" data-action="export">导出 4K PNG</button>',
    '    <button type="button" data-action="cancel-export" hidden>取消导出</button>',
    '    <div data-role="status" role="status"></div></aside>',
    '</div>'
  ].join("");

  function create(options) {
    const doc = options.document || root.document;
    const core = options.core;
    const dialog = doc.createElement("dialog");
    dialog.className = "finish-workbench";
    dialog.innerHTML = TEMPLATE;
    doc.body.appendChild(dialog);
    const canvas = dialog.querySelector('[data-role="canvas"]');
    const overlay = dialog.querySelector('[data-role="overlay"]');
    const sceneBackground = dialog.querySelector('[data-role="scene-background"]');
    const flatEditorCanvas = dialog.querySelector('[data-role="flat-editor"]');
    const status = dialog.querySelector('[data-role="status"]');
    const profiles = dialog.querySelector('[data-role="profiles"]');
    const presetGroups = [
      ["基础烫法", ["raw", "light", "standard", "flat", "back"]],
      ["表面纹理", ["towel", "bath", "waffle", "fabric", "ribbed"]],
      ["特效", ["glitter", "laser", "glitter-fine", "glitter-coarse"]]
    ];
    const availableProfiles = new Map(core.PROFILES.map((profile) => [profile.id, profile]));
    presetGroups.forEach(([label, ids]) => {
      const group = doc.createElement("div");
      group.className = "finish-preset-group";
      const heading = doc.createElement("strong");
      heading.textContent = label;
      group.appendChild(heading);
      ids.forEach((id) => {
        const profile = availableProfiles.get(id);
        if (!profile) return;
        const button = doc.createElement("button");
        button.type = "button";
        button.dataset.profile = id;
        button.textContent = profile.label;
        group.appendChild(button);
      });
      profiles.appendChild(group);
    });
    let viewer = null;
    let openGeneration = 0;
    let exportGeneration = 0;
    let refreshTimer = 0;
    let interactionMode = "view";
    let chosenToolIn3d = false;
    let activeTab = "3d";
    let flatZoomInitialized = false;
    let flatControlsOpenBeforeEdit = true;
    const flatEditorView = { zoom: 1, panX: 0, panY: 0, grid: null, pointer: null };
    const flatPointers = new Map();
    let flatPinch = null;
    function drawFlatEditor() {
      if (activeTab !== "flat" || interactionMode !== "edit" || !dialog.open || !options.renderFlatEditor) return;
      const stage = dialog.querySelector(".finish-stage");
      const dpr = Math.min(root.devicePixelRatio || 1, 2);
      flatEditorCanvas.width = Math.max(1, Math.round(stage.clientWidth * dpr));
      flatEditorCanvas.height = Math.max(1, Math.round(stage.clientHeight * dpr));
      flatEditorView.grid = options.renderFlatEditor(flatEditorCanvas, flatEditorView);
      flatEditorCanvas.style.cursor = options.getToolCursor?.() || "crosshair";
    }
    function updateStageView() {
      const flat = activeTab === "flat";
      const editingFlat = flat && interactionMode === "edit";
      const stage = dialog.querySelector(".finish-stage");
      stage.dataset.view = flat ? "flat" : "3d";
      dialog.querySelector(".finish-body").dataset.view = flat ? "flat" : "3d";
      sceneBackground.hidden = flat;
      canvas.hidden = flat;
      overlay.hidden = flat;
      dialog.querySelector('[data-role="flat"]').hidden = !flat || editingFlat;
      flatEditorCanvas.hidden = !editingFlat;
      dialog.querySelector('[data-role="flat-edit-zoom"]').hidden = !editingFlat;
      dialog.querySelector('[data-role="watermark"]').hidden = flat || core.isCalibrated();
      dialog.querySelector('[data-role="compare"]').hidden = true;
      dialog.querySelector('[data-action="mode-view"]').textContent = flat ? "查看展示图" : "观察视角";
      dialog.querySelector('[data-action="reset-view"]').hidden = flat;
      if (editingFlat) drawFlatEditor();
      if (flat && !editingFlat) options.prepareFlatPreview?.();
    }
    function flatCellAt(event) {
      const grid = flatEditorView.grid;
      if (!grid || !grid.cellSize) return null;
      const rect = flatEditorCanvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * flatEditorCanvas.width / Math.max(1, rect.width);
      const y = (event.clientY - rect.top) * flatEditorCanvas.height / Math.max(1, rect.height);
      if (x < grid.x || y < grid.y || x >= grid.x + grid.width || y >= grid.y + grid.height) return null;
      return { col: Math.floor((x - grid.x) / grid.cellSize), row: Math.floor((y - grid.y) / grid.cellSize) };
    }
    function flatEdit(phase, event) {
      const cell = flatCellAt(event) || (phase === "end" ? flatEditorView.pointer?.lastCell : null);
      if (!cell) return;
      const previous = flatEditorView.pointer?.lastCell;
      let changed = false;
      if (phase === "move" && previous && ["brush", "eraser"].includes(options.getTool?.())) {
        const steps = Math.max(Math.abs(cell.col - previous.col), Math.abs(cell.row - previous.row));
        const line = [];
        for (let step = 1; step <= steps; step += 1) {
          line.push({
            col: Math.round(previous.col + (cell.col - previous.col) * step / steps),
            row: Math.round(previous.row + (cell.row - previous.row) * step / steps)
          });
        }
        if (line.length && options.onEditStroke) changed = Boolean(options.onEditStroke(line)?.changed);
        else for (const between of line) changed = Boolean(options.onEdit?.("move", between)?.changed) || changed;
      } else changed = Boolean(options.onEdit?.(phase, cell)?.changed);
      if (flatEditorView.pointer) flatEditorView.pointer.lastCell = cell;
      if (changed || phase === "end") {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => {
          drawFlatEditor();
          if (phase === "end") options.prepareFlatPreview?.();
          refreshViewer();
        }, phase === "end" ? 0 : 70);
      } else drawFlatEditor();
    }
    flatEditorCanvas.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      flatEditorCanvas.setPointerCapture?.(event.pointerId);
      flatPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (flatPointers.size === 2) {
        const points = [...flatPointers.values()];
        flatPinch = { distance: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y), zoom: flatEditorView.zoom };
        clearTimeout(flatEditorView.pointer?.startTimer);
        if (flatEditorView.pointer?.editing && flatEditorView.pointer.started) flatEdit("end", event);
        flatEditorView.pointer = null;
        return;
      }
      const panning = options.getTool?.() === "pan";
      const pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, panX: flatEditorView.panX, panY: flatEditorView.panY, editing: !panning, started: false };
      flatEditorView.pointer = pointer;
      if (!panning && event.pointerType === "touch") {
        pointer.startTimer = setTimeout(() => {
          if (flatEditorView.pointer === pointer && flatPointers.size === 1) {
            pointer.started = true;
            flatEdit("start", { clientX: pointer.x, clientY: pointer.y });
          }
        }, 90);
      } else if (!panning) {
        pointer.started = true;
        flatEdit("start", event);
      }
    });
    flatEditorCanvas.addEventListener("pointermove", (event) => {
      if (flatPointers.has(event.pointerId)) flatPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (flatPinch && flatPointers.size >= 2) {
        const points = [...flatPointers.values()];
        flatEditorView.zoom = Math.max(.25, Math.min(8, flatPinch.zoom * Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) / Math.max(1, flatPinch.distance)));
        drawFlatEditor();
        return;
      }
      const pointer = flatEditorView.pointer;
      if (!pointer || pointer.id !== event.pointerId) return;
      if (!pointer.editing) {
        const dpr = flatEditorCanvas.width / Math.max(1, flatEditorCanvas.clientWidth);
        flatEditorView.panX = pointer.panX + (event.clientX - pointer.x) * dpr;
        flatEditorView.panY = pointer.panY + (event.clientY - pointer.y) * dpr;
        drawFlatEditor();
      } else {
        if (!pointer.started) {
          clearTimeout(pointer.startTimer);
          pointer.started = true;
          flatEdit("start", { clientX: pointer.x, clientY: pointer.y });
        }
        flatEdit("move", event);
      }
    });
    function stopFlatPointer(event) {
      flatPointers.delete(event.pointerId);
      if (flatPointers.size < 2) flatPinch = null;
      if (flatEditorView.pointer?.id === event.pointerId) {
        clearTimeout(flatEditorView.pointer.startTimer);
        if (flatEditorView.pointer.editing) {
          if (!flatEditorView.pointer.started) flatEdit("start", event);
          flatEdit("end", event);
        }
        flatEditorView.pointer = null;
      }
    }
    flatEditorCanvas.addEventListener("pointerup", stopFlatPointer);
    flatEditorCanvas.addEventListener("pointercancel", stopFlatPointer);
    flatEditorCanvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      flatEditorView.zoom = Math.max(.25, Math.min(8, flatEditorView.zoom * (event.deltaY < 0 ? 1.12 : 1 / 1.12)));
      drawFlatEditor();
    }, { passive: false });
    function setInteractionMode(mode) {
      const previousMode = interactionMode;
      interactionMode = mode === "edit" ? "edit" : "view";
      const flatControls = dialog.querySelector('[data-role="flat-controls-group"]');
      if (activeTab === "flat" && previousMode !== interactionMode) {
        if (interactionMode === "edit") {
          flatControlsOpenBeforeEdit = flatControls.open;
          flatControls.open = false;
        } else flatControls.open = flatControlsOpenBeforeEdit;
      }
      if (interactionMode === "edit" && options.setTool && (!chosenToolIn3d || (options.getTool && options.getTool() === "pan"))) options.setTool("brush");
      if (viewer) viewer.setInteractionMode(interactionMode);
      if (viewer && interactionMode === "edit") viewer.setEditCursor(options.getToolCursor?.());
      dialog.querySelectorAll('[data-action^="mode-"]').forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.action === `mode-${interactionMode}`));
      });
      dialog.querySelector('[data-role="mode-hint"]').textContent = interactionMode === "view"
        ? (activeTab === "flat" ? "拖动文字或贴纸 · 滚轮或双指缩放" : "拖动旋转 · 滚轮或双指缩放")
        : "单击落笔 · 拖动连续绘制";
      dialog.querySelector('[data-role="quick-tools"]').hidden = interactionMode !== "edit";
      dialog.querySelector('[data-role="editor-rails"]').hidden = interactionMode !== "edit";
      dialog.querySelector('[data-role="edit-display"]').hidden = interactionMode !== "edit";
      if (interactionMode === "edit") dialog.querySelector('[data-role="preset-group"]').open = false;
      dialog.querySelector('[data-role="picked"]').textContent = interactionMode === "view"
        ? "观察中 · 切换编辑后可落笔"
        : "编辑中 · 单击或拖动画布";
      if (interactionMode === "edit") {
        dialog.querySelector('[data-role="edit-group"]').open = true;
        dialog.querySelector('[data-role="tool-settings"]').open = true;
      } else {
        dialog.querySelector('[data-role="edit-group"]').open = false;
        dialog.querySelector('[data-role="tool-settings"]').open = false;
        dialog.querySelector('[data-role="layer-group"]').open = false;
      }
      updateStageView();
      syncControls();
    }
    const movedPanels = [];
    function movePanel(id, role) {
      const panel = doc.getElementById(id);
      moveNode(panel, role);
    }
    function moveNode(panel, role) {
      if (!panel || movedPanels.some((item) => item.panel === panel)) return;
      const anchor = doc.createComment(`finish-${role}`);
      panel.parentNode.insertBefore(anchor, panel);
      const inlineStyle = panel.getAttribute("style");
      panel.removeAttribute("style");
      dialog.querySelector(`[data-role="${role}"]`).appendChild(panel);
      movedPanels.push({ panel, anchor, inlineStyle });
    }
    function restorePanels() {
      movedPanels.splice(0).forEach(({ panel, anchor, inlineStyle }) => {
        anchor.parentNode.insertBefore(panel, anchor);
        if (inlineStyle == null) panel.removeAttribute("style");
        else panel.setAttribute("style", inlineStyle);
        anchor.remove();
      });
    }
    function refreshViewer() {
      if (activeTab === "flat" && interactionMode === "edit") drawFlatEditor();
      if (activeTab === "flat" && interactionMode === "view") options.prepareFlatPreview?.();
      if (!viewer) return;
      const current = options.getPattern();
      const analysis = viewer.updatePattern(current);
      if (analysis) dialog.querySelector('[data-role="facts"]').textContent = `${analysis.count.toLocaleString()} 颗 · ${analysis.horizontal + analysis.vertical} 条邻接 · ${analysis.isolated} 个孤点`;
      syncControls();
    }
    let settings = core.normalizeSettings({});
    let snapshot = null;
    const profileDescriptions = {
      raw: "未烫：完整管状侧壁和开孔。",
      light: "轻烫：孔仍明显，顶缘略软化。",
      standard: "标准融合：正反面为连续无孔表面，保留图纸色块。",
      flat: "完全平融：连续无孔表面，厚度更低。",
      back: "背熔：展示面保留高度和孔，背面融合增强。",
      towel: "毛巾：连续表面带细密不规则纤维压痕。",
      bath: "澡巾：连续表面带更粗的网状颗粒压痕。",
      waffle: "华夫格：正交格纹压印。",
      glitter: "闪片：离散高光随光线变化，保留原豆色。",
      laser: "镭射：角度相关薄膜虹彩，保留原豆色。",
      "glitter-fine": "细闪：较细、较稀疏的离散亮点。",
      "glitter-coarse": "粗闪：较大的闪片颗粒与高光。",
      fabric: "布纹：连续表面上的交织压纹。",
      ribbed: "横纹：连续表面上的横向压纹。"
    };

    function syncControls() {
      profiles.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.profile === settings.profile));
      dialog.querySelector('[data-role="profile-label"]').textContent = availableProfiles.get(settings.profile)?.label || "自定义";
      const description = dialog.querySelector('[data-role="profile-description"]');
      if (description) description.textContent = `${profileDescriptions[settings.profile]} ${core.isCalibrated() ? "当前使用已验收实测模型。" : "当前为未实物标定参考模型。"}`;
      dialog.querySelectorAll('.finish-view-buttons button').forEach((button) => button.classList.toggle("active", button.dataset.action === settings.side));
      dialog.querySelector('[data-role="exposure"]').value = Math.round(settings.exposure * 100);
      dialog.querySelector('[data-role="light-intensity"]').value = Math.round(settings.lightIntensity * 100);
      dialog.querySelector('[data-role="light-temperature"]').value = settings.lightTemperature;
      const tuning = core.tuningFor(settings, settings.profile);
      for (const [name, value] of Object.entries(tuning)) {
        dialog.querySelector(`[data-tuning="${name}"]`).value = value;
        dialog.querySelector(`[data-value="${name}"]`).textContent = `${value}%`;
      }
      dialog.querySelector('[data-role="show-codes"]').checked = settings.showCodes;
      dialog.querySelector('[data-role="show-grid"]').checked = settings.showGrid;
      dialog.querySelector('[data-role="h1-opacity"]').value = settings.h1Opacity;
      dialog.querySelector('[data-role="h1-opacity-label"]').textContent = `${settings.h1Opacity}%`;
      dialog.querySelector('[data-role="show-guides"]').checked = options.getGuidesVisible?.() !== false;
      dialog.querySelector('[data-role="quick-show-codes"]').checked = settings.showCodes;
      dialog.querySelector('[data-role="quick-show-grid"]').checked = settings.showGrid;
      dialog.querySelector('[data-role="quick-show-guides"]').checked = options.getGuidesVisible?.() !== false;
      const current = options.getCanvasSize?.();
      dialog.querySelector('[data-role="canvas-size"]').textContent = current ? `画布 ${current.width} × ${current.height} 格` : "画布尺寸";
      const toolButton = doc.querySelector(`#dropZone .tool-button[data-tool="${options.getTool?.()}"]`) || dialog.querySelector(`.tool-button[data-tool="${options.getTool?.()}"]`);
      dialog.querySelector('[data-role="active-tool"]').textContent = `当前工具：${toolButton?.title || options.getTool?.() || "画笔"}`;
      if (viewer && interactionMode === "edit") viewer.setEditCursor(options.getToolCursor?.());
      for (const [name, role] of [["codeOpacity", "code-opacity"], ["codeSize", "code-size"]]) {
        dialog.querySelector(`[data-role="${role}"]`).value = settings[name];
        dialog.querySelector(`[data-value="${name}"]`).textContent = `${settings[name]}%`;
      }
      dialog.querySelector('[data-role="board-mode"]').value = settings.boardMode;
      dialog.querySelector('[data-role="board-color"]').value = settings.boardColor;
      dialog.querySelector('[data-role="board-alpha"]').value = settings.boardAlpha;
      dialog.querySelector('[data-role="board-alpha-label"]').textContent = `${settings.boardAlpha}%`;
      dialog.querySelector('[data-role="board-image-name"]').textContent = settings.boardImageName || "未选择";
      dialog.querySelector('[data-action="clear-board-image"]').disabled = !settings.boardImageData;
      dialog.querySelectorAll('[data-tool]').forEach((button) => {
        const active = button.dataset.tool === (options.getTool && options.getTool());
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }
    function saveSettings() {
      if (options.onSettings) options.onSettings(Object.assign({}, settings));
    }

    let backgroundObserver = null;
    function drawSceneBackground() {
      const stage = dialog.querySelector(".finish-stage");
      if (stage.clientWidth < 1 || stage.clientHeight < 1 || !options.renderBackground) return;
      const dpr = Math.min(root.devicePixelRatio || 1, 2);
      sceneBackground.width = Math.max(1, Math.round(stage.clientWidth * dpr));
      sceneBackground.height = Math.max(1, Math.round(stage.clientHeight * dpr));
      options.renderBackground(sceneBackground);
    }
    function syncBackgroundControls() {
      if (!options.getBackground) return;
      const background = options.getBackground();
      const select = dialog.querySelector('[data-role="background-material"]');
      if (!select.options.length) {
        (background.materials || []).forEach(({ value, label }) => select.add(new Option(label, value)));
      }
      select.value = background.type;
      dialog.querySelector('[data-role="background-color"]').value = background.color;
      dialog.querySelector('[data-role="background-alpha"]').value = background.alpha;
      dialog.querySelector('[data-role="background-alpha-label"]').textContent = `${background.alpha}%`;
      drawSceneBackground();
    }
    function syncLightEffect() {
      if (!options.getLightEffect) return;
      const effect = options.getLightEffect();
      const select = dialog.querySelector('[data-role="light-effect"]');
      if (!select.options.length) (effect.options || []).forEach(({ value, label }) => select.add(new Option(label, value)));
      select.value = effect.value;
      viewer?.setLightEffect(effect.value);
    }
    function switchTab(tab) {
      if (tab === "3d" && dialog.querySelector('[data-action="tab-3d"]').disabled) tab = "flat";
      activeTab = tab === "flat" ? "flat" : "3d";
      dialog.querySelector('[data-role="flat-controls-group"]').open = activeTab === "flat" && interactionMode === "view";
      dialog.querySelectorAll('[role="tab"]').forEach((button) => button.setAttribute("aria-selected", String(button.dataset.action === `tab-${activeTab}`)));
      updateStageView();
      dialog.querySelector('[data-role="mode-hint"]').textContent = interactionMode === "view"
        ? (activeTab === "flat" ? "拖动文字或贴纸 · 滚轮或双指缩放" : "拖动旋转 · 滚轮或双指缩放")
        : "单击落笔 · 拖动连续绘制";
      if (activeTab === "flat" && interactionMode === "view" && !flatZoomInitialized) {
        flatZoomInitialized = true;
        root.requestAnimationFrame?.(() => options.fitFlatPreview?.());
      } else if (activeTab === "3d") {
        syncBackgroundControls();
        syncLightEffect();
        viewer?.draw();
      }
    }

    async function open(tab = "3d") {
      const pattern = options.getPattern();
      if (!pattern || !pattern.cells) return false;
      close();
      const generation = ++openGeneration;
      // 先加载标定清单：实测数据就绪时隐藏水印并提示，失败时静默回退通用模型。
      try {
        const response = await fetch("./3d/calibration-manifest.json", { cache: "no-cache" });
        if (response.ok) {
          const manifest = await response.json();
          if (generation !== openGeneration) return true;
          root.__QPIXEL_CALIBRATION_MANIFEST__ = manifest;
        }
      } catch (_) {}
      if (generation !== openGeneration) return true;
      const calibrated = core.isCalibrated();
      const watermark = dialog.querySelector('[data-role="watermark"]');
      if (watermark) watermark.hidden = calibrated;
      settings = core.normalizeSettings(options.getSettings ? options.getSettings() : {});
      activeTab = "3d";
      flatZoomInitialized = false;
      Object.assign(flatEditorView, { zoom: 1, panX: 0, panY: 0, grid: null, pointer: null });
      flatPointers.clear();
      flatPinch = null;
      chosenToolIn3d = false;
      setInteractionMode("view");
      syncControls();
      movePanel("toolOptionsPanel", "tool-options");
      movePanel("rightLayerPanel", "layers");
      moveNode(doc.querySelector("#dropZone .canvas-tool-rail:not(.rail-b)"), "rail-main");
      moveNode(doc.querySelector("#dropZone .canvas-tool-rail.rail-b"), "rail-extra");
      movePanel("colorStrip", "color-strip");
      moveNode(doc.querySelector("#materialPreviewModal .material-canvas-wrap"), "flat");
      moveNode(doc.querySelector("#materialPreviewModal .material-controls"), "flat-controls");
      // 空白工程也是可编辑的 3D 画布。
      // WebGL2 预检：不支持时直接给出可读解释，不再尝试加载 500KB 引擎。
      const support = window.QPixelWebGLSupport || root.QPixelWebGLSupport;
      const capability = support ? support.detectWebGL2(doc) : { supported: true, tier: "full", message: "" };
      dialog.querySelector('[data-action="tab-3d"]').disabled = !capability.supported;
      dialog.querySelector('[data-role="notice"]').hidden = capability.supported;
      if (!capability.supported) {
        dialog.showModal();
        status.textContent = `${capability.message} 可继续使用平面展示图。`;
        dialog.querySelector('[data-role="notice"]').textContent = status.textContent;
        switchTab("flat");
        return true;
      }
      dialog.showModal();
      switchTab(tab);
      syncBackgroundControls();
      backgroundObserver = new ResizeObserver(() => { drawSceneBackground(); drawFlatEditor(); });
      backgroundObserver.observe(dialog.querySelector(".finish-stage"));
      status.textContent = "正在加载 3D 引擎…";
      try {
        await options.loadViewer();
        if (!dialog.open || generation !== openGeneration) return true;
        viewer = root.QPixel3D.create({
          canvas,
          overlay,
          pattern,
          colorOf: options.colorOf,
          getGuides: options.getGuides,
          getSelection: options.getSelection,
          settings: { ...settings, background: "transparent" },
          onPick: (cell) => {
            dialog.querySelector('[data-role="picked"]').textContent = `第 ${cell.row + 1} 行 · 第 ${cell.col + 1} 列 · ${cell.code || "空格"}`;
          },
          onEdit: (phase, cell) => {
            const result = options.onEdit && options.onEdit(phase, cell);
            if (result && result.changed) {
              clearTimeout(refreshTimer);
              refreshTimer = setTimeout(refreshViewer, phase === "end" ? 0 : 70);
            }
            else if (viewer) viewer.draw();
            return result;
          },
          onStatus: (text) => { if (generation === openGeneration && dialog.open) status.textContent = text; }
        });
        viewer.setInteractionMode("view");
        viewer.setEditCursor(options.getToolCursor?.());
        viewer.setBackground("transparent");
        viewer.setBoardBackground(settings);
        syncLightEffect();
        const analysis = core.analyze(pattern.cells);
        dialog.querySelector('[data-role="facts"]').textContent = `${analysis.count.toLocaleString()} 颗 · ${analysis.horizontal + analysis.vertical} 条邻接 · ${analysis.isolated} 个孤点`;
        if (capability.message) status.textContent = capability.message;
      } catch (error) {
        if (generation !== openGeneration || !dialog.open) return true;
        status.textContent = `3D 加载失败：${error && error.message ? error.message : error}。图纸编辑与普通导出仍可使用。`;
        dialog.querySelector('[data-action="tab-3d"]').disabled = true;
        dialog.querySelector('[data-role="notice"]').hidden = false;
        dialog.querySelector('[data-role="notice"]').textContent = status.textContent;
        switchTab("flat");
      }
      return true;
    }

    function close() {
      openGeneration++;
      exportGeneration++;
      dialog.querySelector('[data-action="cancel-export"]').hidden = true;
      dialog.querySelector('[data-action="export"]').disabled = false;
      if (viewer) viewer.setInteractionMode("view");
      clearTimeout(refreshTimer);
      clearTimeout(flatEditorView.pointer?.startTimer);
      flatEditorView.pointer = null;
      flatPointers.clear();
      flatPinch = null;
      backgroundObserver?.disconnect();
      backgroundObserver = null;
      restorePanels();
      if (viewer) viewer.dispose();
      viewer = null;
      if (dialog.open) dialog.close();
    }

    profiles.addEventListener("click", (event) => {
      const button = event.target.closest("[data-profile]");
      if (!button) return;
      settings.profile = button.dataset.profile;
      if (viewer) viewer.setProfile(settings.profile);
      syncControls();
      saveSettings();
    });
    dialog.querySelectorAll('[data-tuning]').forEach((slider) => slider.addEventListener("input", (event) => {
      const tuning = { ...core.tuningFor(settings, settings.profile), [event.target.dataset.tuning]: Number(event.target.value) };
      settings.profileTuning = { ...(settings.profileTuning || {}), [settings.profile]: tuning };
      dialog.querySelector(`[data-value="${event.target.dataset.tuning}"]`).textContent = `${event.target.value}%`;
      if (viewer) viewer.setTuning(tuning);
      saveSettings();
    }));
    [["show-codes", "showCodes"], ["show-grid", "showGrid"], ["code-opacity", "codeOpacity"], ["code-size", "codeSize"]].forEach(([role, key]) => {
      const element = dialog.querySelector(`[data-role="${role}"]`);
      element.addEventListener(element.type === "checkbox" ? "change" : "input", () => {
        settings[key] = element.type === "checkbox" ? element.checked : Number(element.value);
        if (viewer) viewer.setOverlay(settings);
        drawFlatEditor();
        syncControls(); saveSettings();
      });
    });
    for (const [role, key] of [["quick-show-codes", "showCodes"], ["quick-show-grid", "showGrid"]]) {
      dialog.querySelector(`[data-role="${role}"]`).addEventListener("change", (event) => {
        settings[key] = event.target.checked;
        viewer?.setOverlay(settings);
        drawFlatEditor();
        syncControls(); saveSettings();
      });
    }
    for (const role of ["show-guides", "quick-show-guides"]) {
      dialog.querySelector(`[data-role="${role}"]`).addEventListener("change", (event) => {
        options.setGuidesVisible?.(event.target.checked);
        viewer?.draw();
        drawFlatEditor();
        syncControls();
      });
    }
    function chooseTool(event) {
      const button = event.target.closest('[data-tool]');
      if (!button || !options.setTool) return;
      chosenToolIn3d = true;
      options.setTool(button.dataset.tool);
      setInteractionMode("edit");
      syncControls();
      if (button.dataset.tool === "clear-layer") refreshViewer();
    }
    dialog.querySelector('[data-role="quick-tools"]').addEventListener("click", chooseTool);
    dialog.querySelector('[data-role="editor-rails"]').addEventListener("click", (event) => {
      if (event.target.closest('[data-tool]')) {
        chosenToolIn3d = true;
        if (interactionMode !== "edit") setInteractionMode("edit");
        clearTimeout(refreshTimer); refreshTimer = setTimeout(refreshViewer, 0);
      }
    });
    dialog.querySelector('[data-role="tool-options"]').addEventListener("click", () => {
      clearTimeout(refreshTimer); refreshTimer = setTimeout(refreshViewer, 0);
    });
    dialog.querySelector('[data-role="layers"]').addEventListener("click", () => {
      clearTimeout(refreshTimer); refreshTimer = setTimeout(refreshViewer, 0);
    });
    dialog.querySelector('[data-role="exposure"]').addEventListener("input", (event) => {
      settings.exposure = Number(event.target.value) / 100;
      if (viewer) viewer.setExposure(settings.exposure);
      saveSettings();
    });
    dialog.querySelector('[data-role="h1-opacity"]').addEventListener("input", (event) => {
      settings.h1Opacity = Math.max(0, Math.min(100, Number(event.target.value) || 0));
      if (viewer) viewer.setH1Opacity(settings.h1Opacity);
      options.onH1Opacity?.(settings.h1Opacity);
      syncControls();
      saveSettings();
    });
    dialog.querySelector('[data-role="light-intensity"]').addEventListener("input", (event) => {
      settings.lightIntensity = Number(event.target.value) / 100;
      if (viewer) viewer.setLighting(settings.lightIntensity, settings.lightTemperature);
      saveSettings();
    });
    dialog.querySelector('[data-role="light-temperature"]').addEventListener("change", (event) => {
      settings.lightTemperature = event.target.value;
      if (viewer) viewer.setLighting(settings.lightIntensity, settings.lightTemperature);
      saveSettings();
    });
    for (const [role, key, eventName] of [["background-material", "type", "change"], ["background-color", "color", "input"], ["background-alpha", "alpha", "input"]]) {
      dialog.querySelector(`[data-role="${role}"]`).addEventListener(eventName, (event) => {
        options.setBackground?.({ [key]: event.target.value });
      });
    }
    dialog.querySelector('[data-role="board-mode"]').addEventListener("change", (event) => {
      if (event.target.value === "image" && !settings.boardImageData) {
        event.target.value = settings.boardMode;
        dialog.querySelector('[data-role="board-image-file"]').click();
        return;
      }
      settings.boardMode = event.target.value;
      viewer?.setBoardBackground(settings);
      saveSettings();
    });
    dialog.querySelector('[data-role="board-color"]').addEventListener("input", (event) => {
      settings.boardColor = event.target.value;
      settings.boardMode = "color";
      viewer?.setBoardBackground(settings);
      syncControls(); saveSettings();
    });
    dialog.querySelector('[data-role="board-alpha"]').addEventListener("input", (event) => {
      settings.boardAlpha = Number(event.target.value);
      dialog.querySelector('[data-role="board-alpha-label"]').textContent = `${settings.boardAlpha}%`;
      viewer?.setBoardBackground(settings);
      saveSettings();
    });
    dialog.querySelector('[data-role="board-image-file"]').addEventListener("change", async (event) => {
      const file = event.target.files && event.target.files[0];
      event.target.value = "";
      if (!file) return;
      if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 10000000) {
        status.textContent = "请选择不超过 10 MB 的 PNG、JPEG、WebP 或 GIF 图片。";
        return;
      }
      try {
        const data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("背板图片读取失败"));
          reader.readAsDataURL(file);
        });
        if (!dialog.open || typeof data !== "string") return;
        const preview = new Image();
        preview.src = data;
        await preview.decode();
        if (!dialog.open) return;
        settings.boardImageData = data;
        settings.boardImageName = file.name.slice(0, 120);
        settings.boardMode = "image";
        viewer?.setBoardBackground(settings);
        syncControls(); saveSettings();
      } catch (error) { status.textContent = error.message || "背板图片无法读取"; }
    });
    dialog.querySelector('[data-role="light-effect"]').addEventListener("change", (event) => {
      options.setLightEffect?.(event.target.value);
      viewer?.setLightEffect(event.target.value);
    });
    dialog.addEventListener("click", async (event) => {
      const action = event.target.closest("[data-action]") ? event.target.closest("[data-action]").dataset.action : null;
      if (!action) return;
      if (action === "close") close();
      if (action === "tab-3d") switchTab("3d");
      if (action === "tab-flat") switchTab("flat");
      if (action === "background-image") options.chooseBackgroundImage?.();
      if (action === "board-image") dialog.querySelector('[data-role="board-image-file"]').click();
      if (action === "clear-board-image") {
        settings.boardImageData = "";
        settings.boardImageName = "";
        if (settings.boardMode === "image") settings.boardMode = "transparent";
        viewer?.setBoardBackground(settings);
        syncControls(); saveSettings();
      }
      if (action === "mode-view") setInteractionMode("view");
      if (action === "mode-edit") setInteractionMode("edit");
      if (action === "reset-view" && viewer) viewer.view(settings.side);
      if (["flat-zoom-in", "flat-zoom-out", "flat-zoom-fit"].includes(action)) {
        if (action === "flat-zoom-fit") Object.assign(flatEditorView, { zoom: 1, panX: 0, panY: 0 });
        else flatEditorView.zoom = Math.max(.25, Math.min(8, flatEditorView.zoom * (action === "flat-zoom-in" ? 1.25 : .8)));
        drawFlatEditor();
      }
      if (action === "reset-tuning") {
        delete settings.profileTuning[settings.profile];
        if (viewer) viewer.setProfile(settings.profile);
        syncControls(); saveSettings();
      }
      if (["rotate-left", "rotate-right", "tilt-up", "tilt-down", "zoom-in", "zoom-out"].includes(action) && viewer) viewer.moveCamera(action);
      if ((action === "undo" || action === "redo") && options.onHistory) {
        options.onHistory(action);
        refreshViewer();
      }
      if (action === "front" || action === "back" || action === "angle") {
        settings.side = action;
        if (viewer) viewer.view(action);
        syncControls();
        saveSettings();
      }
      if (action === "snapshot" && viewer) {
        const image = new Image();
        image.src = viewer.snapshot();
        await image.decode();
        const composed = doc.createElement("canvas");
        composed.width = canvas.width;
        composed.height = canvas.height;
        options.renderBackground?.(composed);
        composed.getContext("2d").drawImage(image, 0, 0);
        snapshot = composed.toDataURL("image/png");
        status.textContent = "已保存当前视角，可分屏比较。";
      }
      if (action === "compare" && snapshot) {
        const pane = dialog.querySelector('[data-role="compare"]');
        pane.querySelector("img").src = snapshot;
        pane.hidden = false;
      }
      if (action === "hide-compare") dialog.querySelector('[data-role="compare"]').hidden = true;
      if (action === "cancel-export" && viewer) {
        exportGeneration++; viewer.cancelExport();
        dialog.querySelector('[data-action="cancel-export"]').hidden = true;
        dialog.querySelector('[data-action="export"]').disabled = false;
        status.textContent = "已取消导出。";
      }
      if (action === "export" && viewer) {
        const generation = openGeneration, request = ++exportGeneration;
        const current = () => generation === openGeneration && request === exportGeneration && dialog.open;
        const cancel = dialog.querySelector('[data-action="cancel-export"]');
        const exportButton = dialog.querySelector('[data-action="export"]');
        exportButton.disabled = true;
        cancel.hidden = false;
        try {
          const blob = await viewer.exportPng({
            size: 4096,
            onProgress: (value) => { if (current()) status.textContent = `正在导出 4K：${value}%`; }
          });
          if (!current()) return;
          const bitmap = await createImageBitmap(blob);
          if (!current()) { bitmap.close(); return; }
          const composed = doc.createElement("canvas");
          composed.width = bitmap.width;
          composed.height = bitmap.height;
          options.renderBackground?.(composed);
          composed.getContext("2d").drawImage(bitmap, 0, 0);
          bitmap.close();
          const compositeBlob = await new Promise((resolve, reject) => composed.toBlob((result) => result ? resolve(result) : reject(new Error("PNG 合成失败")), "image/png"));
          if (!current()) return;
          await options.onExport(compositeBlob);
          if (current()) status.textContent = "4K PNG 已导出。";
        } catch (error) {
          if (current()) status.textContent = error && error.message ? error.message : "导出失败";
        } finally {
          if (current()) { cancel.hidden = true; exportButton.disabled = false; }
        }
      }
    });
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });

    return Object.freeze({ open, close, refreshBackground: syncBackgroundControls, refreshLightEffect: syncLightEffect });
  }

  return Object.freeze({ create });
});
