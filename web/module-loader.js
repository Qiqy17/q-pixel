(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelModuleLoader = api.createLoader({ document: root.document });
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function createLoader(options) {
    const settings = options || {};
    const documentRef = settings.document || null;
    const records = new Map();

    function resourceKey(type, source) {
      return `${type}:${String(source || "").trim()}`;
    }

    function loadElement(type, source, attributes) {
      const src = String(source || "").trim();
      if (!src) return Promise.reject(new Error("资源地址不能为空。"));
      if (!documentRef || typeof documentRef.createElement !== "function") {
        return Promise.reject(new Error("当前环境不能加载页面资源。"));
      }
      const key = resourceKey(type, src);
      const existing = records.get(key);
      if (existing) return existing.promise;

      const record = { key, source: src, state: "loading", error: null, element: null, promise: null };
      record.promise = new Promise((resolve, reject) => {
        const element = documentRef.createElement(type === "style" ? "link" : "script");
        record.element = element;
        if (type === "style") {
          element.rel = "stylesheet";
          element.href = src;
        } else {
          element.src = src;
          element.async = attributes && attributes.async === false ? false : true;
        }
        Object.entries(attributes || {}).forEach(([name, value]) => {
          if (name === "async") return;
          element.setAttribute(name, String(value));
        });
        element.addEventListener("load", () => {
          record.state = "ready";
          resolve(element);
        }, { once: true });
        element.addEventListener("error", () => {
          record.state = "failed";
          record.error = new Error(`资源加载失败：${src}`);
          if (typeof settings.onError === "function") settings.onError(record.error, Object.assign({}, record));
          reject(record.error);
        }, { once: true });
        const parent = documentRef.head || documentRef.body || documentRef.documentElement;
        parent.appendChild(element);
      });
      records.set(key, record);
      return record.promise;
    }

    function loadScript(source, attributes) {
      return loadElement("script", source, attributes);
    }

    function loadStyle(source, attributes) {
      return loadElement("style", source, attributes);
    }

    function getState(type, source) {
      const record = records.get(resourceKey(type, source));
      return record ? record.state : "idle";
    }

    function snapshot() {
      return Array.from(records.values()).map((record) => ({
        key: record.key,
        source: record.source,
        state: record.state,
        error: record.error ? record.error.message : ""
      }));
    }

    return Object.freeze({ getState, loadScript, loadStyle, snapshot });
  }

  return Object.freeze({ createLoader });
});
