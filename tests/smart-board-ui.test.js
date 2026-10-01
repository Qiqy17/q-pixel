"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const code = fs.readFileSync(require.resolve("../web/make/smart-board-ui.js"), "utf8");
function fixture(size = 32) {
  const elements = new Map(), messages = [], timers = new Set();
  const el = (key) => {
    if (!elements.has(key)) elements.set(key, { value: "", checked: false, disabled: false, handlers: {},
      addEventListener(type, callback) { this.handlers[type] = callback; },
      replaceChildren() { this.value = ""; }, add(option) { if (!this.value) this.value = option.value; },
      getContext() { return { fillRect() {}, strokeRect() {} }; }
    });
    return elements.get(key);
  };
  const host = { querySelector(selector) { return el(selector.match(/="(.*?)"/)[1]); }, addEventListener() {} };
  el("columns").value = el("rows").value = String(size); el("rotation").value = "0";
  let finishPng;
  const window = {
    webkit: { messageHandlers: { smartBoard: { postMessage(message) { messages.push(message); } } } },
    QPixelSmartBoardExport: require("../web/make/smart-board-export.js"),
    QPixelPixDotProtocol: require("../web/make/pixdot-protocol.js"),
    QPixelSmartBoardPackage: { png() { return new Promise(resolve => { finishPng = resolve; }); } }
  };
  vm.runInNewContext(code, { window, AbortController, Option: function (text, value) { this.value = value; },
    setTimeout(callback) { const token = {}; timers.add(token); return token; }, clearTimeout(token) { timers.delete(token); },
    btoa: value => Buffer.from(value, "binary").toString("base64") });
  window.QPixelSmartBoardUI.create({ host, getPattern: () => ({ width: 1, height: 1, cells: [["H2"]] }),
    palette: [{ code: "H2", hex: "#ffffff", rgb: { r: 255, g: 255, b: 255 } }] });
  const click = key => el(key).handlers.click();
  const reply = (action, extra = {}) => { const request = messages.slice().reverse().find(m => m.action === action); window.QPixelSmartBoardNative({ id: request.id, ...extra }); };
  async function connect() { el("devices").value = "qa-device"; const task = click("connect"); reply("connect", { size }); await task; }
  return { el, messages, timers, window, click, reply, connect, finishPng: () => finishPng(Uint8Array.of(1, 2, 3)) };
}
(async () => {
  // Cancellation while asynchronous PNG preparation is pending must not send later.
  for (const size of [32, 52]) for (const stop of ["cancel", "disconnected"]) {
    const f = fixture(size); await f.connect(); const task = f.click("send");
    if (stop === "cancel") { f.click("cancel"); f.reply("cancel"); }
    else f.window.QPixelSmartBoardNative({ type: "disconnected" });
    f.finishPng(); await Promise.race([task, new Promise((_, reject) => setTimeout(() => reject(new Error("send stalled: " + JSON.stringify(f.messages))), 1000))]);
    assert.equal(f.messages.filter(m => m.action === "send").length, 0, `${stop}: no send after PNG completes`);
    assert.equal(f.el("send").disabled, false); assert.equal(f.el("cancel").disabled, true);
    assert.equal(f.timers.size, 0);
  }
  // A late success response after cancellation must not overwrite the cancel status.
  const f = fixture(); await f.connect(); const task = f.click("send"); f.finishPng(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.messages.filter(m => m.action === "send").length, 1);
  f.click("cancel"); f.reply("cancel"); f.reply("send"); await task;
  assert.match(f.el("status").textContent, /取消/); assert.doesNotMatch(f.el("status").textContent, /确认接收完整/);
  const status = f.el("status").textContent;
  f.window.QPixelSmartBoardNative({ type: "progress", done: 1, total: 8 });
  assert.equal(f.el("status").textContent, status, "late progress cannot revive cancelled send");
  // Normal sends still await the completion response and can be retried after cancellation.
  const retry = f.click("send"); f.finishPng(); await new Promise(resolve => setImmediate(resolve)); f.reply("send"); await retry;
  assert.match(f.el("status").textContent, /确认接收完整/); assert.equal(f.timers.size, 0);
  const broken = fixture(); broken.window.webkit.messageHandlers.smartBoard.postMessage = () => { throw new Error("bridge failed"); };
  broken.el("devices").value = "qa-device"; await broken.click("connect");
  assert.match(broken.el("status").textContent, /bridge failed/); assert.equal(broken.timers.size, 0);
  console.log("smart-board-ui: cancellation during PNG, disconnect, late reply/progress, retry and bridge failure passed");
})().catch(error => { console.error(error); process.exit(1); });
