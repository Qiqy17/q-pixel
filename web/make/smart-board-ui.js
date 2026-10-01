(function () {
  "use strict";
  window.QPixelSmartBoardUI = { create({ host, getPattern, palette, makeZip, saveFile }) {
    if (!host) return;
    host.innerHTML = `<summary>智能拼豆板</summary>
      <p>通用导出保留原始色号。格数预设不代表已通过品牌兼容认证。</p>
      <label>板尺寸 <select data-board="size"><option>32</option><option selected>52</option><option>64</option><option>78</option><option>104</option><option value="custom">自定义</option></select></label>
      <div class="smart-board-row"><label>列 <input data-board="columns" type="number" min="1" max="500" value="52" disabled></label><label>行 <input data-board="rows" type="number" min="1" max="500" value="52" disabled></label></div>
      <div class="smart-board-row"><label>顺时针旋转 <select data-board="rotation"><option value="0">0°</option><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select></label><label><input data-board="mirror" type="checkbox">水平镜像</label></div>
      <label><input data-board="perColor" type="checkbox" checked>包含逐色图</label>
      <button type="button" data-board="refresh">刷新智能板预览</button>
      <canvas data-board="preview" aria-label="智能板分块预览"></canvas>
      <label>当前板 <select data-board="board"></select></label>
      <p data-board="summary"></p><p data-board="status" role="status" aria-live="polite"></p>
      <div class="smart-board-row"><button type="button" data-board="export">导出智能板ZIP</button><button type="button" data-board="cancel" disabled>取消</button></div>
      <div data-board="native" hidden><h4>像素糖果HPD蓝牙试点</h4><p>实验性功能，待实机验证。一次发送当前板；设备颜色未标定。</p>
        <div class="smart-board-row"><button type="button" data-board="scan">扫描设备</button><select data-board="devices" aria-label="扫描到的设备"></select></div>
        <div class="smart-board-row"><button type="button" data-board="connect">连接</button><button type="button" data-board="disconnect">断开</button></div>
        <label>亮度 <input data-board="light" type="number" min="0" max="100" value="50"></label><button type="button" data-board="brightness">发送亮度设置</button>
        <label>颜色引导 <select data-board="color"><option value="">整图</option></select></label><p>单色引导用白光标出目标格，便于看清黑色豆位置；原始色号不变。</p><button type="button" data-board="send">发送当前板预览</button>
      </div><p data-board="webNote">此浏览器使用文件导出；直接蓝牙试点需使用新版Mac App。</p>`;
    const el = (name) => host.querySelector(`[data-board="${name}"]`);
    let current = null, aborter = null, busy = false, connectedSize = 0, sequence = 0;
    let sending = false, sendCancelled = false;
    const pending = new Map(), native = window.webkit?.messageHandlers?.smartBoard;
    el("native").hidden = !native; el("webNote").hidden = !!native;
    function status(message) { el("status").textContent = message; }
    function refresh() {
      try {
        current = window.QPixelSmartBoardExport.plan(getPattern(), palette, { columns: Number(el("columns").value), rows: Number(el("rows").value), rotation: el("rotation").value, mirror: el("mirror").checked });
        const selected = el("board").value;
        el("board").replaceChildren();
        current.boards.forEach((b) => el("board").add(new Option(`第${b.index}板 · 行${b.y + 1}–${b.y + b.validRows} 列${b.x + 1}–${b.x + b.validColumns}`, String(b.index))));
        if (current.boards.some((b) => String(b.index) === selected)) el("board").value = selected;
        el("summary").textContent = `源图${current.source.width}×${current.source.height} → ${current.width}×${current.height}，${current.boards.length}板，${current.usage.length}色。`;
        draw(); return current;
      } catch (error) { current = null; el("board").replaceChildren(); el("summary").textContent = ""; el("preview").width = 0; status(error.message); return null; }
    }
    function draw() {
      if (!current) return;
      const canvas = el("preview"), scale = Math.min(4, 500 / current.width, 500 / current.height);
      canvas.width = Math.ceil(current.width * scale); canvas.height = Math.ceil(current.height * scale);
      const ctx = canvas.getContext("2d"); ctx.fillStyle = "#e9e9e9"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < current.height; y++) for (let x = 0; x < current.width; x++) {
        const code = current.cells[y][x]; if (code === null) continue;
        ctx.fillStyle = current.colors.get(code).hex; ctx.fillRect(x * scale, y * scale, scale, scale);
      }
      ctx.lineWidth = 1;
      current.boards.forEach((b) => { ctx.strokeStyle = String(b.index) === el("board").value ? "#ed4433" : "#666"; ctx.strokeRect(b.x * scale + .5, b.y * scale + .5, b.validColumns * scale - 1, b.validRows * scale - 1); });
      const board = selectedBoard(), previous = el("color").value;
      el("color").replaceChildren(new Option("整图", ""));
      board?.usage.forEach(({ code, count }) => el("color").add(new Option(`${code} · ${count}颗`, code)));
      if (board?.usage.some((c) => c.code === previous)) el("color").value = previous;
    }
    function selectedBoard() { return current?.boards.find((b) => String(b.index) === el("board").value); }
    function setBusy(value) {
      busy = value; el("cancel").disabled = !value;
      ["export", "send", "scan", "connect", "brightness"].forEach((key) => { el(key).disabled = value; });
    }
    function callNative(action, data = {}) {
      return new Promise((resolve, reject) => {
        const id = ++sequence;
        const timer = setTimeout(() => { pending.delete(id); reject(new Error("设备操作超时，请断开后重连。")); }, action === "send" ? 120000 : 20000);
        pending.set(id, { resolve, reject, timer });
        try { native.postMessage({ id, action, ...data }); }
        catch (error) { pending.delete(id); clearTimeout(timer); reject(error); }
      });
    }
    window.QPixelSmartBoardNative = (event) => {
      if (event.type === "disconnected") { if (sending) sendCancelled = true; connectedSize = 0; status(event.message || "设备已断开。"); }
      if (event.type === "progress" && sending && !sendCancelled) status(`发送中 ${event.done}/${event.total} 帧`);
      const task = pending.get(event.id);
      if (task) { pending.delete(event.id); clearTimeout(task.timer); event.error ? task.reject(new Error(event.error)) : task.resolve(event); }
    };
    function deviceOptions(devices) {
      el("devices").replaceChildren(); (devices || []).forEach((device) => el("devices").add(new Option(device.name, device.id)));
    }
    el("size").addEventListener("change", () => {
      const custom = el("size").value === "custom";
      ["columns", "rows"].forEach((key) => { el(key).disabled = !custom; if (!custom) el(key).value = el("size").value; }); refresh();
    });
    ["columns", "rows", "rotation", "mirror"].forEach((key) => el(key).addEventListener("change", refresh));
    el("board").addEventListener("change", draw); el("refresh").addEventListener("click", refresh);
    host.addEventListener("toggle", () => { if (host.open && !busy) refresh(); });
    el("cancel").addEventListener("click", () => { if (sending) sendCancelled = true; aborter?.abort(); if (native && busy && !aborter) callNative("cancel").catch((e) => status(e.message)); });
    el("export").addEventListener("click", async () => {
      if (busy) return;
      const plan = refresh(); if (!plan) return;
      aborter = new AbortController(); setBusy(true); status("正在生成导出包…");
      try {
        const blob = await window.QPixelSmartBoardPackage.build(plan, { makeZip, perColor: el("perColor").checked, signal: aborter.signal, onProgress: (done, total) => status(`导出中 ${done}/${total} 板`) });
        if (!aborter.signal.aborted) { saveFile(blob, `Q像素-智能板-${Date.now()}.zip`, "application/zip", "智能板ZIP已保存。"); status("导出包已生成，请完成保存。库存未改变色号。"); }
      } catch (error) { status(error.message); } finally { aborter = null; setBusy(false); }
    });
    async function operation(action, data) {
      if (busy) return;
      setBusy(true);
      try { return await callNative(action, data); } catch (error) { status(error.message); } finally { setBusy(false); }
    }
    el("scan").addEventListener("click", async () => { status("正在扫描…"); const result = await operation("scan"); if (result) { deviceOptions(result.devices); status(result.devices.length ? "请选择设备后连接。" : "未发现PDD设备，请确认板子开启且未被其他APP占用。"); } });
    el("connect").addEventListener("click", async () => {
      if (!el("devices").value) return status("请先扫描并选择设备。");
      const result = await operation("connect", { device: el("devices").value });
      if (result) { connectedSize = result.size; status(`已查询到${result.size}×${result.size}板。兼容性仍待实机验收。`); }
    });
    el("disconnect").addEventListener("click", () => { if (native) callNative("disconnect").catch((e) => status(e.message)); });
    el("brightness").addEventListener("click", async () => {
      if (!connectedSize) return status("请先连接设备。");
      try { const frame = window.QPixelPixDotProtocol.brightness(Number(el("light").value)); const result = await operation("control", { bytes: Array.from(frame) }); if (result) status("亮度指令已发送，实际效果请检查板子。"); } catch (error) { status(error.message); }
    });
    el("send").addEventListener("click", async () => {
      if (busy) return; if (!connectedSize) return status("请先连接设备。");
      const selectedColor = el("color").value, plan = refresh(), board = selectedBoard();
      if (!plan || !board) return;
      if (board.columns !== connectedSize || board.rows !== connectedSize) return status("导出板尺寸与实际设备不符，请选择相同格数。");
      if (selectedColor && !board.usage.some((c) => c.code === selectedColor)) return status("图纸已变化，请重新选择颜色。");
      sending = true; sendCancelled = false; setBusy(true);
      const checkSend = () => { if (sendCancelled || !connectedSize) throw new Error("发送已取消或设备已断开。"); };
      try {
        const displayPlan = selectedColor ? { ...plan, colors: new Map(plan.colors) } : plan;
        if (selectedColor) displayPlan.colors.set(selectedColor, { code: selectedColor, rgb: { r: 255, g: 255, b: 255 }, hex: "#ffffff" });
        const bytes = connectedSize >= 78 ? window.QPixelSmartBoardExport.rgb888(displayPlan, board, selectedColor || undefined) : await window.QPixelSmartBoardPackage.png(displayPlan, board, selectedColor || undefined);
        checkSend();
        const frames = window.QPixelPixDotProtocol.imageFrames(bytes, connectedSize).map((f) => {
          let binary = ""; for (const byte of f) binary += String.fromCharCode(byte); return btoa(binary);
        });
        await callNative("send", { frames, size: connectedSize }); checkSend(); status("设备已确认接收完整预览；显示效果请检查板子。");
      } catch (error) { status(error.message + " 画面可能未完整；重连后可重新发送。"); } finally { sending = false; setBusy(false); }
    });
    return { refresh };
  } };
})();
