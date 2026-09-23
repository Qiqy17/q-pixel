"use strict";
const assert = require("node:assert/strict");
const support = require("../web/3d/webgl-support.js");

assert.equal(support.SUPPORT_VERSION, "webgl-support-1");
assert.equal(typeof support.detectWebGL2, "function");
assert.equal(typeof support.watchContext, "function");
assert.equal(typeof support.memoryBudget, "function");

// 无 document 环境（Node）：不可用分级。
const noDoc = support.detectWebGL2(null);
assert.equal(noDoc.supported, false);
assert.equal(noDoc.tier, "unavailable");
assert.ok(noDoc.message.length > 0);

// createElement 抛异常：canvas-blocked 分支。
const hostileDoc = { createElement: () => { throw new Error("blocked"); } };
const blocked = support.detectWebGL2(hostileDoc);
assert.equal(blocked.supported, false);
assert.equal(blocked.reason, "canvas-blocked");

// getContext 返回 null：WebGL1 降级提示。
const stubDoc = {
  createElement: () => ({ width: 1, height: 1, getContext: () => null })
};
const webgl1 = support.detectWebGL2(stubDoc);
assert.equal(webgl1.supported, false);
assert.equal(webgl1.tier, "webgl1");
assert.ok(webgl1.message.includes("WebGL2"));

// 各纹理上限的分级：4096+ full、2048~4095 limited、<2048 weak。
function stubWithTexture(size) {
  return {
    createElement: () => ({
      width: 1, height: 1,
      getContext: () => ({
        getParameter: () => size,
        getExtension: () => null
      })
    })
  };
}
assert.equal(support.detectWebGL2(stubWithTexture(8192)).tier, "full");
assert.equal(support.detectWebGL2(stubWithTexture(4096)).tier, "full");
assert.equal(support.detectWebGL2(stubWithTexture(2048)).tier, "limited");
assert.equal(support.detectWebGL2(stubWithTexture(1024)).tier, "weak");
assert.ok(support.detectWebGL2(stubWithTexture(8192)).maxTextureSize === 8192);

// contextlost 事件应 preventDefault 并触发 onLost。
const listeners = {};
const fakeCanvas = {
  addEventListener: (name, handler) => { listeners[name] = handler; },
  removeEventListener: (name) => { delete listeners[name]; }
};
let lostCalled = false;
let restoredCalled = false;
const unwatch = support.watchContext(fakeCanvas, {
  onLost: () => { lostCalled = true; },
  onRestored: () => { restoredCalled = true; }
});
assert.ok(listeners.webglcontextlost && listeners.webglcontextrestored);
const fakeEvent = { preventDefault: () => { fakeEvent.defaultPrevented = true; } };
listeners.webglcontextlost(fakeEvent);
assert.equal(lostCalled, true);
assert.equal(fakeEvent.defaultPrevented, true);
// 恢复回调带 200ms 防抖，用定时器验证。
listeners.webglcontextrestored();
setTimeout(() => {
  assert.equal(restoredCalled, true);
  unwatch();
  assert.ok(!listeners.webglcontextlost, "卸载后监听器应被移除");
  // null canvas 不抛异常。
  assert.equal(typeof support.watchContext(null, {}), "function");
  // 内存预算：Node 环境无 navigator.deviceMemory 时给出保守建议。
  const budget = support.memoryBudget();
  assert.equal(typeof budget.suggestLowDetail, "boolean");
  console.log("webgl-support tests: PASS");
}, 260);
