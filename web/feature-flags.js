(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelFeatureFlags = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const STORAGE_KEY = "q-pixel-feature-flags-v2";
  const DEFAULTS = Object.freeze({
    professionalWorkspace: true,
    patternRebuild: true,
    photoreal3d: true
  });

  function normalize(source) {
    const input = source && typeof source === "object" ? source : {};
    return Object.keys(DEFAULTS).reduce((flags, key) => {
      flags[key] = input[key] === true;
      return flags;
    }, {});
  }

  function parseQuery(search) {
    const params = new URLSearchParams(String(search || "").replace(/^\?/, ""));
    const enabled = String(params.get("qpixelFeatures") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return enabled.reduce((flags, key) => {
      if (Object.prototype.hasOwnProperty.call(DEFAULTS, key)) flags[key] = true;
      return flags;
    }, {});
  }

  function readStored(storage) {
    if (!storage || typeof storage.getItem !== "function") return {};
    try {
      const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || "{}");
      return Object.keys(DEFAULTS).reduce((result, key) => {
        if (typeof parsed[key] === "boolean") result[key] = parsed[key];
        return result;
      }, {});
    } catch {
      return {};
    }
  }

  function createFeatureFlags(options) {
    const settings = options || {};
    const storage = settings.storage || null;
    const listeners = new Set();
    let flags = normalize(Object.assign(
      {},
      DEFAULTS,
      readStored(storage),
      settings.initial || {},
      parseQuery(settings.search || "")
    ));

    function persist() {
      if (!storage || typeof storage.setItem !== "function") return;
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(flags));
      } catch {
        // A blocked local cache must never prevent the stable workspace loading.
      }
    }

    function notify() {
      const snapshot = all();
      listeners.forEach((listener) => listener(snapshot));
    }

    function all() {
      return Object.assign({}, flags);
    }

    function isEnabled(name) {
      return Object.prototype.hasOwnProperty.call(DEFAULTS, name) && flags[name] === true;
    }

    function set(name, enabled) {
      if (!Object.prototype.hasOwnProperty.call(DEFAULTS, name)) return false;
      const next = enabled === true;
      if (flags[name] === next) return true;
      flags = Object.assign({}, flags, { [name]: next });
      persist();
      notify();
      return true;
    }

    function reset() {
      flags = normalize(DEFAULTS);
      persist();
      notify();
      return all();
    }

    function subscribe(listener) {
      if (typeof listener !== "function") return function () {};
      listeners.add(listener);
      return function () { listeners.delete(listener); };
    }

    return Object.freeze({ all, isEnabled, reset, set, subscribe });
  }

  let storage = null;
  try {
    storage = root && root.localStorage ? root.localStorage : null;
  } catch {
    storage = null;
  }
  const search = root && root.location ? root.location.search : "";
  const initial = root && root.QPIXEL_FEATURE_FLAGS ? root.QPIXEL_FEATURE_FLAGS : {};
  const instance = createFeatureFlags({ storage, search, initial });

  return Object.freeze({
    DEFAULTS,
    STORAGE_KEY,
    createFeatureFlags,
    normalize,
    parseQuery,
    all: instance.all,
    isEnabled: instance.isEnabled,
    reset: instance.reset,
    set: instance.set,
    subscribe: instance.subscribe
  });
});
