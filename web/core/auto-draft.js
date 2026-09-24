(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelAutoDraft = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const INTERVALS = Object.freeze([0, 15000, 30000, 60000, 180000, 300000]);

  function normalizeInterval(value) {
    if (value == null || value === "") return 180000;
    const number = Number(value);
    return INTERVALS.includes(number) ? number : 180000;
  }

  function createVault(options = {}) {
    const indexedDB = options.indexedDB;
    const legacyStore = options.legacyStore;
    const storage = options.storage;
    const dbName = options.dbName || "q-pixel-drafts";
    let dbPromise = null;

    function database() {
      if (!indexedDB) return Promise.resolve(null);
      if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 2);
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains("drafts")) request.result.createObjectStore("drafts");
          if (!request.result.objectStoreNames.contains("history")) request.result.createObjectStore("history");
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("草稿数据库无法打开"));
      }).catch(() => null);
      return dbPromise;
    }

    async function transaction(storeName, mode, action) {
      const db = await database();
      if (!db) return { available: false, value: null };
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const request = action(tx.objectStore(storeName));
        let value = null;
        if (request) {
          request.onsuccess = () => { value = request.result; };
          request.onerror = () => reject(request.error || new Error("草稿操作失败"));
        }
        tx.oncomplete = () => resolve({ available: true, value });
        tx.onerror = () => reject(tx.error || new Error("草稿事务失败"));
        tx.onabort = () => reject(tx.error || new Error("草稿事务中止"));
      });
    }

    async function save(payload) {
      if (!payload || !payload.pattern) throw new Error("草稿内容为空");
      try {
        const result = await transaction("drafts", "readwrite", (store) => store.put(payload, "active"));
        if (result.available) return "indexeddb";
      } catch (_) {}
      if (!legacyStore) throw new Error("本机草稿空间不可用");
      legacyStore.writePayload(payload);
      return "localstorage";
    }

    async function load() {
      let primary = null;
      try { primary = (await transaction("drafts", "readonly", (store) => store.get("active"))).value; } catch (_) {}
      let legacy = null;
      if (legacyStore) {
        try { legacyStore.recover(); legacy = legacyStore.readPayload().payload; } catch (_) {}
      }
      if (!primary) return legacy;
      if (!legacy) return primary;
      return new Date(primary.savedAt || 0) >= new Date(legacy.savedAt || 0) ? primary : legacy;
    }

    async function clear() {
      try { await transaction("drafts", "readwrite", (store) => store.delete("active")); } catch (_) {}
      if (legacyStore && storage) {
        try { storage.removeItem(legacyStore.mainKey); storage.removeItem(legacyStore.journalKey); } catch (_) {}
      }
    }

    async function saveHistory(projectId, history) {
      if (!projectId || !Array.isArray(history)) return false;
      const result = await transaction("history", "readwrite", (store) => store.put(history, String(projectId)));
      return result.available;
    }

    async function loadHistory(projectId) {
      if (!projectId) return [];
      try {
        const result = await transaction("history", "readonly", (store) => store.get(String(projectId)));
        return Array.isArray(result.value) ? result.value : [];
      } catch (_) { return []; }
    }

    return Object.freeze({ save, load, clear, saveHistory, loadHistory });
  }

  return Object.freeze({ INTERVALS, normalizeInterval, createVault });
});
