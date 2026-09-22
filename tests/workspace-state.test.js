"use strict";

const assert = require("node:assert/strict");
const featureFlags = require("../web/feature-flags.js");
const moduleLoader = require("../web/module-loader.js");
const workspaceState = require("../web/core/workspace-state.js");
const domUtils = require("../web/core/dom-utils.js");

assert.deepEqual(featureFlags.normalize({ professionalWorkspace: true, unknown: true }), {
  professionalWorkspace: true,
  patternRebuild: false,
  photoreal3d: false
});
assert.deepEqual(featureFlags.parseQuery("?qpixelFeatures=professionalWorkspace,photoreal3d"), {
  professionalWorkspace: true,
  photoreal3d: true
});

const memory = new Map();
const storage = {
  getItem: (key) => memory.get(key) || null,
  setItem: (key, value) => memory.set(key, value)
};
const flags = featureFlags.createFeatureFlags({ storage });
assert.deepEqual(flags.all(), featureFlags.DEFAULTS, "默认必须保持旧工作区");
assert.equal(flags.isEnabled("professionalWorkspace"), false);
flags.set("professionalWorkspace", true);
assert.equal(flags.isEnabled("professionalWorkspace"), true);
assert.equal(JSON.parse(memory.get(featureFlags.STORAGE_KEY)).professionalWorkspace, true);
flags.reset();
assert.equal(flags.isEnabled("professionalWorkspace"), false);

assert.equal(workspaceState.viewportForWidth(1400), "desktop");
assert.equal(workspaceState.viewportForWidth(900), "tablet");
assert.equal(workspaceState.viewportForWidth(600), "compact");
let workspace = workspaceState.normalize();
assert.deepEqual(workspace, workspaceState.DEFAULT_STATE);
workspace = workspaceState.reduce(workspace, { type: "set-stage", stage: "make" });
assert.equal(workspace.stage, "make");
workspace = workspaceState.reduce(workspace, { type: "toggle-inspector" });
assert.equal(workspace.inspectorOpen, false);
workspace = workspaceState.reduce(workspace, { type: "set-stage", stage: "invalid" });
assert.equal(workspace.stage, "make", "无效阶段不能破坏当前状态");

function makeFakeElement(tagName) {
  const listeners = {};
  return {
    tagName,
    classList: {
      values: new Set(),
      toggle(name, enabled) { enabled ? this.values.add(name) : this.values.delete(name); }
    },
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, listener) { listeners[name] = listener; },
    dispatch(name) { if (listeners[name]) listeners[name](); }
  };
}

const appended = [];
const fakeDocument = {
  createElement: makeFakeElement,
  head: {
    appendChild(element) {
      appended.push(element);
      queueMicrotask(() => element.dispatch("load"));
    }
  }
};
const loader = moduleLoader.createLoader({ document: fakeDocument });
const firstLoad = loader.loadScript("./future-module.js");
const secondLoad = loader.loadScript("./future-module.js");
assert.equal(firstLoad, secondLoad, "同一模块必须复用一次加载 Promise");

Promise.all([firstLoad, secondLoad]).then(() => {
  assert.equal(appended.length, 1, "同一模块只能插入一个 script");
  assert.equal(loader.getState("script", "./future-module.js"), "ready");

  const element = makeFakeElement("button");
  element.textContent = "";
  assert.equal(domUtils.setHidden(element, true), true);
  assert.equal(element.classList.values.has("hidden"), true);
  assert.equal(element.attributes["aria-hidden"], "true");
  domUtils.setSelected(element, true);
  assert.equal(element.classList.values.has("active"), true);
  domUtils.setText(element, "安全文本");
  assert.equal(element.textContent, "安全文本");

  console.log("workspace-state tests: PASS");
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
