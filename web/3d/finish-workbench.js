(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelFinishWorkbench = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const TEMPLATE = [
    '<div class="finish-top">',
    '  <div><span class="studio-eyebrow">FINISH LAB / 3D</span><h2>成品材质工作台</h2><p>5 mm 拼豆 · 十种熨烫状态 · 可旋转检查</p></div>',
    '  <button type="button" data-action="close" aria-label="关闭">×</button>',
    '</div>',
    '<div class="finish-body">',
    '  <aside class="finish-profiles"><strong>烫法预设</strong><div data-role="profiles"></div>',
    '    <p>当前均为<strong>未标定通用模型</strong>。真实 MARD 5 mm 标定需要实拍样片与尺寸测量。</p></aside>',
    '  <main class="finish-stage"><canvas data-role="canvas"></canvas>',
    '    <span class="finish-watermark" data-role="watermark">UN CALIBRATED · GENERIC MODEL</span>',
    '    <div class="finish-compare" data-role="compare" hidden><img alt="保存的对比视角"><button type="button" data-action="hide-compare">关闭对比</button></div></main>',
    '  <aside class="finish-controls"><strong>视角与材质</strong>',
    '    <div class="finish-view-buttons"><button type="button" data-action="front">正面</button><button type="button" data-action="back">背面</button></div>',
    '    <label>曝光<input data-role="exposure" type="range" min="50" max="180" value="100"></label>',
    '    <label>背景<select data-role="background"><option value="photo">摄影背景</option><option value="transparent">透明</option></select></label>',
    '    <div class="finish-facts"><span data-role="facts">等待载入</span><span data-role="picked">双击单颗豆查看色号</span></div>',
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
    let settings = core.normalizeSettings({});
    let snapshot = null;

    function syncControls() {
      profiles.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.profile === settings.profile));
      dialog.querySelector('[data-role="exposure"]').value = Math.round(settings.exposure * 100);
      dialog.querySelector('[data-role="background"]').value = settings.background;
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
      if (profileNote && calibrated) profileNote.textContent = "当前使用实测标定模型（MARD 5 mm 实拍样片）。";
      settings = core.normalizeSettings(options.getSettings ? options.getSettings() : {});
      syncControls();
      // 空图纸保护：没有豆子时跳过引擎加载，避免空实例网格触发几何计算异常。
      if (!core.analyze(pattern.cells).count) {
        dialog.showModal();
        status.textContent = "当前图纸没有豆子，先绘制或导入内容再使用 3D 预览。";
        return true;
      }
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
          pattern,
          colorOf: options.colorOf,
          settings,
          onPick: (cell) => {
            dialog.querySelector('[data-role="picked"]').textContent = `第 ${cell.row + 1} 行 · 第 ${cell.col + 1} 列 · ${cell.code}`;
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
    dialog.querySelector('[data-role="exposure"]').addEventListener("input", (event) => {
      settings.exposure = Number(event.target.value) / 100;
      if (viewer) viewer.setExposure(settings.exposure);
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
      if (action === "front" || action === "back") {
        settings.side = action;
        if (viewer) viewer.view(action);
        saveSettings();
      }
      if (action === "snapshot" && viewer) {
        viewer.draw();
        snapshot = canvas.toDataURL("image/png");
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
