(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelFinishWorkbench = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const TEMPLATE = [
    '<div class="finish-top">',
    '  <div><span class="studio-eyebrow">FINISH LAB / 3D</span><h2>成品材质工作台</h2><p>5 mm 拼豆 · 多种熨烫状态 · 可旋转检查</p></div>',
    '  <button type="button" data-action="close" aria-label="关闭">×</button>',
    '</div>',
    '<div class="finish-body">',
    '  <aside class="finish-profiles"><strong>烫法预设</strong><div data-role="profiles"></div>',
    '    <p data-role="profile-description">当前为<strong>未实物标定参考模型</strong>。可旋转检查孔洞、厚度与表面。</p></aside>',
    '  <main class="finish-stage"><canvas data-role="canvas"></canvas><canvas data-role="overlay" aria-hidden="true"></canvas>',
    '    <span class="finish-watermark" data-role="watermark">参考模拟 · 未实物标定</span>',
    '    <div class="finish-compare" data-role="compare" hidden><img alt="保存的对比视角"><button type="button" data-action="hide-compare">关闭对比</button></div></main>',
    '  <aside class="finish-controls"><strong>视角与材质</strong>',
    '    <div class="finish-view-buttons"><button type="button" data-action="angle">斜侧</button><button type="button" data-action="front">正面</button><button type="button" data-action="back">背面</button></div>',
    '    <div class="finish-view-buttons"><button type="button" data-action="rotate-left" title="左转">↶</button><button type="button" data-action="rotate-right" title="右转">↷</button><button type="button" data-action="tilt-up" title="抬高">↑</button><button type="button" data-action="tilt-down" title="降低">↓</button><button type="button" data-action="zoom-in" title="放大">＋</button><button type="button" data-action="zoom-out" title="缩小">－</button></div>',
    '    <details class="finish-control-group" open><summary>熨烫质感</summary><label>纹理粗糙程度 <output data-value="textureRoughness"></output><input data-tuning="textureRoughness" type="range" min="0" max="100"></label><label>纹理透明度 <output data-value="textureOpacity"></output><input data-tuning="textureOpacity" type="range" min="0" max="100"></label><label>融边程度 <output data-value="meltEdge"></output><input data-tuning="meltEdge" type="range" min="0" max="100"></label><button type="button" data-action="reset-tuning">恢复当前烫法默认</button></details>',
    '    <details class="finish-control-group"><summary>图纸与标记</summary><label><input data-role="show-codes" type="checkbox">显示色号</label><label><input data-role="show-grid" type="checkbox">显示网格</label><label>色号透明度 <output data-value="codeOpacity"></output><input data-role="code-opacity" type="range" min="0" max="100"></label><label>色号大小 <output data-value="codeSize"></output><input data-role="code-size" type="range" min="0" max="100"></label><p>缩放过小时会暂时隐藏细字与网格，放大后恢复。</p></details>',
    '    <details class="finish-control-group" open><summary>3D 绘画工具</summary><div data-role="tools"></div><p>画布用于绘画；旋转和缩放请用上方按钮。按住豆子 2 秒高亮同色。</p><div data-role="editor-actions"><button type="button" data-action="undo">撤销</button><button type="button" data-action="redo">重做</button></div></details>',
    '    <details class="finish-control-group" open><summary>工具参数与色板</summary><div data-role="tool-options"></div></details>',
    '    <details class="finish-control-group"><summary>图层</summary><div data-role="layers"></div></details>',
    '    <label>曝光<input data-role="exposure" type="range" min="50" max="180" value="100"></label>',
    '    <label>观察光照强度<input data-role="light-intensity" type="range" min="50" max="160" value="100"></label>',
    '    <label>观察光色<select data-role="light-temperature"><option value="neutral">中性对照光</option><option value="warm">暖光</option><option value="cool">冷光</option></select></label>',
    '    <p class="finish-light-note">光照只改变预览，不修改图纸色号；当前未做实物色差标定。</p>',
    '    <label>背景<select data-role="background"><option value="photo">浅色</option><option value="dark">深色</option><option value="transparent">透明</option></select></label>',
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
    const status = dialog.querySelector('[data-role="status"]');
    const profiles = dialog.querySelector('[data-role="profiles"]');
    core.PROFILES.forEach((profile) => {
      const button = doc.createElement("button");
      button.type = "button";
      button.dataset.profile = profile.id;
      button.textContent = profile.label;
      profiles.appendChild(button);
    });
    let viewer = null;
    let refreshTimer = 0;
    const movedPanels = [];
    function movePanel(id, role) {
      const panel = doc.getElementById(id);
      if (!panel || movedPanels.some((item) => item.panel === panel)) return;
      const anchor = doc.createComment(`finish-${id}`);
      panel.parentNode.insertBefore(anchor, panel);
      dialog.querySelector(`[data-role="${role}"]`).appendChild(panel);
      movedPanels.push({ panel, anchor });
    }
    function restorePanels() {
      movedPanels.splice(0).forEach(({ panel, anchor }) => {
        anchor.parentNode.insertBefore(panel, anchor);
        anchor.remove();
      });
    }
    function refreshViewer() {
      if (!viewer) return;
      const current = options.getPattern();
      viewer.updatePattern(current);
      dialog.querySelector('[data-role="facts"]').textContent = `${core.analyze(current.cells).count.toLocaleString()} 颗`;
      syncControls();
    }
    let settings = core.normalizeSettings({});
    let snapshot = null;
    const toolNames = { brush: "画笔", picker: "取色", eraser: "橡皮", bucket: "填充", palette: "色板", select: "选区", "rect-fill": "填充矩形", "rect-clear": "清空区域", shape: "图形", outline: "描边", "clear-layer": "清空图层", pan: "移动视图", recolor: "配色", guide: "辅助线" };
    Object.entries(toolNames).forEach(([id, label]) => {
      const button = doc.createElement("button");
      button.type = "button";
      button.dataset.tool = id;
      button.textContent = label;
      dialog.querySelector('[data-role="tools"]').appendChild(button);
    });
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
      const description = dialog.querySelector('[data-role="profile-description"]');
      if (description) description.textContent = `${profileDescriptions[settings.profile]} ${core.isCalibrated() ? "当前使用已验收实测模型。" : "当前为未实物标定参考模型。"}`;
      dialog.querySelectorAll('.finish-view-buttons button').forEach((button) => button.classList.toggle("active", button.dataset.action === settings.side));
      dialog.querySelector('[data-role="exposure"]').value = Math.round(settings.exposure * 100);
      dialog.querySelector('[data-role="light-intensity"]').value = Math.round(settings.lightIntensity * 100);
      dialog.querySelector('[data-role="light-temperature"]').value = settings.lightTemperature;
      dialog.querySelector('[data-role="background"]').value = settings.background;
      const tuning = core.tuningFor(settings, settings.profile);
      for (const [name, value] of Object.entries(tuning)) {
        dialog.querySelector(`[data-tuning="${name}"]`).value = value;
        dialog.querySelector(`[data-value="${name}"]`).textContent = `${value}%`;
      }
      dialog.querySelector('[data-role="show-codes"]').checked = settings.showCodes;
      dialog.querySelector('[data-role="show-grid"]').checked = settings.showGrid;
      for (const [name, role] of [["codeOpacity", "code-opacity"], ["codeSize", "code-size"]]) {
        dialog.querySelector(`[data-role="${role}"]`).value = settings[name];
        dialog.querySelector(`[data-value="${name}"]`).textContent = `${settings[name]}%`;
      }
      dialog.querySelectorAll('[data-tool]').forEach((button) => button.classList.toggle("active", button.dataset.tool === (options.getTool && options.getTool())));
    }
    function saveSettings() {
      if (options.onSettings) options.onSettings(Object.assign({}, settings));
    }

    async function open() {
      const pattern = options.getPattern();
      if (!pattern || !pattern.cells) return false;
      // 先加载标定清单：实测数据就绪时隐藏水印并提示，失败时静默回退通用模型。
      try {
        const response = await fetch("./3d/calibration-manifest.json", { cache: "no-cache" });
        if (response.ok) root.__QPIXEL_CALIBRATION_MANIFEST__ = await response.json();
      } catch (_) {}
      const calibrated = core.isCalibrated();
      const watermark = dialog.querySelector('[data-role="watermark"]');
      if (watermark) watermark.hidden = calibrated;
      const profileNote = dialog.querySelector(".finish-profiles p");
      if (profileNote && calibrated) profileNote.textContent = "当前使用已验收的 MARD 5 mm 实测标定模型。";
      settings = core.normalizeSettings(options.getSettings ? options.getSettings() : {});
      syncControls();
      movePanel("toolOptionsPanel", "tool-options");
      movePanel("rightLayerPanel", "layers");
      // 空白工程也是可编辑的 3D 画布。
      // WebGL2 预检：不支持时直接给出可读解释，不再尝试加载 500KB 引擎。
      const support = window.QPixelWebGLSupport || root.QPixelWebGLSupport;
      const capability = support ? support.detectWebGL2(doc) : { supported: true, tier: "full", message: "" };
      if (!capability.supported) {
        dialog.showModal();
        status.textContent = capability.message;
        return true;
      }
      dialog.showModal();
      status.textContent = "正在加载 3D 引擎…";
      try {
        await options.loadViewer();
        if (!dialog.open) return true;
        viewer = root.QPixel3D.create({
          canvas,
          overlay,
          pattern,
          colorOf: options.colorOf,
          getGuides: options.getGuides,
          getSelection: options.getSelection,
          settings,
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
          onStatus: (text) => { status.textContent = text; }
        });
        const analysis = core.analyze(pattern.cells);
        dialog.querySelector('[data-role="facts"]').textContent = `${analysis.count.toLocaleString()} 颗 · ${analysis.horizontal + analysis.vertical} 条邻接 · ${analysis.isolated} 个孤点`;
        if (capability.message) status.textContent = capability.message;
      } catch (error) {
        status.textContent = `3D 加载失败：${error && error.message ? error.message : error}。图纸编辑与普通导出仍可使用。`;
      }
      return true;
    }

    function close() {
      clearTimeout(refreshTimer);
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
        syncControls(); saveSettings();
      });
    });
    dialog.querySelector('[data-role="tools"]').addEventListener("click", (event) => {
      const button = event.target.closest('[data-tool]');
      if (!button || !options.setTool) return;
      if (button.dataset.tool === "pan") {
        status.textContent = "3D 画布保持绘画操作；请用上方方向与缩放按钮移动视角。";
        return;
      }
      options.setTool(button.dataset.tool);
      syncControls();
      if (button.dataset.tool === "clear-layer") refreshViewer();
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
    dialog.querySelector('[data-role="background"]').addEventListener("change", (event) => {
      settings.background = event.target.value;
      if (viewer) viewer.setBackground(settings.background);
      saveSettings();
    });
    dialog.addEventListener("click", async (event) => {
      const action = event.target.closest("[data-action]") ? event.target.closest("[data-action]").dataset.action : null;
      if (!action) return;
      if (action === "close") close();
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
        snapshot = viewer.snapshot();
        status.textContent = "已保存当前视角，可分屏比较。";
      }
      if (action === "compare" && snapshot) {
        const pane = dialog.querySelector('[data-role="compare"]');
        pane.querySelector("img").src = snapshot;
        pane.hidden = false;
      }
      if (action === "hide-compare") dialog.querySelector('[data-role="compare"]').hidden = true;
      if (action === "cancel-export" && viewer) viewer.cancelExport();
      if (action === "export" && viewer) {
        const cancel = dialog.querySelector('[data-action="cancel-export"]');
        cancel.hidden = false;
        try {
          const blob = await viewer.exportPng({
            size: 4096,
            onProgress: (value) => { status.textContent = `正在导出 4K：${value}%`; }
          });
          await options.onExport(blob);
          status.textContent = "4K PNG 已导出。";
        } catch (error) {
          status.textContent = error && error.message ? error.message : "导出失败";
        } finally {
          cancel.hidden = true;
        }
      }
    });
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });

    return Object.freeze({ open, close });
  }

  return Object.freeze({ create });
});
