(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelProjectStore = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const STORE_VERSION = "project-store-1";
  const PAYLOAD_VERSION_2 = 2;
  const MAX_CHECKPOINTS = 4;
  const CHECKPOINT_REASONS = Object.freeze(["import", "rebuild", "batch-replace", "color-optimize", "manual"]);

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function fingerprintOf(model, payload) {
    if (model && typeof model.payloadFingerprint === "function") return model.payloadFingerprint(payload);
    // 兜底：注入 model 缺失时使用全局 project-model 的静态指纹算法，保证检查点可去重。
    const globalRef = typeof window !== "undefined" ? window : globalThis;
    const staticApi = globalRef && typeof globalRef.QPixelProjectModel === "object" ? globalRef.QPixelProjectModel : null;
    if (staticApi && typeof staticApi.payloadFingerprint === "function") return staticApi.payloadFingerprint(payload);
    return "";
  }

  // v1 → v2 无损迁移：原字段全部保留，仅补充缺失的 v2 字段容器。
  function migrateToV2(payload, model) {
    if (!payload || typeof payload !== "object") return null;
    if (Number(payload.version) === PAYLOAD_VERSION_2) return payload;
    const next = clone(payload);
    next.version = PAYLOAD_VERSION_2;
    if (!next.importSource && (next.importRecipe || next.sourceLabel)) {
      next.importSource = {
        type: next.importRecipe && next.importRecipe.type ? String(next.importRecipe.type) : "unknown",
        label: next.sourceLabel ? String(next.sourceLabel) : "",
        recipe: next.importRecipe || null
      };
    }
    if (!next.rebuildReport) next.rebuildReport = null;
    if (!next.inventorySnapshot) next.inventorySnapshot = null;
    if (!next.boardPlan) next.boardPlan = null;
    if (!next.finish3d) next.finish3d = null;
    if (!Array.isArray(next.checkpoints)) next.checkpoints = [];
    return next;
  }

  function normalizeCheckpoint(checkpoint, model) {
    if (!checkpoint || !checkpoint.payload) return null;
    const payload = clone(checkpoint.payload);
    // 检查点只保存内容快照，剥离嵌套检查点，避免存储逐层膨胀。
    payload.checkpoints = [];
    return {
      id: String(checkpoint.id || `cp-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`),
      reason: CHECKPOINT_REASONS.includes(checkpoint.reason) ? checkpoint.reason : "manual",
      label: String(checkpoint.label || ""),
      at: String(checkpoint.at || new Date().toISOString()),
      fingerprint: String(checkpoint.fingerprint || fingerprintOf(model, payload)),
      version: Number(checkpoint.version) === PAYLOAD_VERSION_2 ? PAYLOAD_VERSION_2 : 1,
      payload
    };
  }

  // 纯函数检查点构造：把任意 payload 快照为检查点（剥离嵌套检查点），供内存态使用。
  function makeCheckpoint(payload, reason, label, model) {
    if (!payload || typeof payload !== "object") return null;
    const migrated = migrateToV2(payload, model);
    return normalizeCheckpoint({ reason, label, at: new Date().toISOString(), payload: migrated }, model);
  }

  // 存储适配器：默认 localStorage，测试可注入内存实现。
  function createMemoryStorage(initial) {
    const data = new Map(Object.entries(initial || {}).map(([key, value]) => [key, String(value)]));
    const failureKeys = new Map();
    const storageApi = {
      getItem: (key) => (data.has(key) ? data.get(key) : null),
      setItem: (key, value) => {
        const remaining = failureKeys.get(key) || 0;
        if (remaining > 0) {
          if (remaining === 1) failureKeys.delete(key);
          else failureKeys.set(key, remaining - 1);
          throw new Error("QuotaExceededError");
        }
        data.set(key, String(value));
      },
      removeItem: (key) => data.delete(key),
      key: (index) => Array.from(data.keys())[index] || null,
      get length() { return data.size; },
      failNextSetsOn(key, times) { failureKeys.set(String(key), Math.max(1, Number(times) || 1)); },
      corrupt(key) { if (data.has(key)) data.set(key, "{corrupted-json"); }
    };
    return storageApi;
  }

  function wrapLocalStorage(storage) {
    return {
      getItem: (key) => {
        try { return storage.getItem(key); }
        catch (_) { return null; }
      },
      setItem: (key, value) => { storage.setItem(key, value); },
      removeItem: (key) => {
        try { storage.removeItem(key); }
        catch (_) {}
      }
    };
  }

  function createStore(options) {
    const settings = options || {};
    const model = settings.model || null;
    const storage = settings.storage || null;
    const projectId = String(settings.projectId || "");
    const keyPrefix = settings.keyPrefix || "q-pixel-project-payload-v2";
    const mainKey = `${keyPrefix}:${projectId}`;
    const journalKey = `${keyPrefix}:${projectId}:journal`;

    function readRaw(key) {
      try {
        const text = storage.getItem(key);
        if (!text) return { ok: false, value: null };
        const parsed = JSON.parse(text);
        return { ok: true, value: parsed };
      } catch (_) {
        return { ok: false, value: null };
      }
    }

    function writeRaw(key, value) {
      storage.setItem(key, JSON.stringify(value));
    }

    // 读取并迁移到 v2；损坏时返回 { payload: null, corrupted: true }。
    function readPayload() {
      const main = readRaw(mainKey);
      if (!main.ok) return { payload: null, corrupted: Boolean(storage.getItem(mainKey)) };
      return { payload: migrateToV2(main.value, model), corrupted: false };
    }

    // 原子写入：日志先行，主键后写，成功后清理日志。
    function writePayload(payload) {
      const migrated = migrateToV2(payload, model);
      if (!migrated) throw new Error("项目内容为空，拒绝写入");
      writeRaw(journalKey, migrated);
      writeRaw(mainKey, migrated);
      storage.removeItem(journalKey);
      return migrated;
    }

    // 崩溃恢复：只承认最后一个完整事务。
    // 日志存在时：主键损坏/缺失 → 从日志前滚；指纹一致 → 事务已完成，清理日志；不一致 → 日志事务未完成，丢弃。
    function recover() {
      const journal = readRaw(journalKey);
      const journalExists = Boolean(storage.getItem(journalKey));
      if (!journalExists) return { recovered: false, action: "none", payload: null };
      const main = readRaw(mainKey);
      const mainExists = Boolean(storage.getItem(mainKey));
      if (!main.ok || !mainExists) {
        if (journal.ok && journal.value) {
          try { writeRaw(mainKey, journal.value); } catch (_) {
            return { recovered: false, action: "journal-kept", payload: null };
          }
          storage.removeItem(journalKey);
          return { recovered: true, action: "rolled-forward", payload: migrateToV2(journal.value, model) };
        }
        storage.removeItem(journalKey);
        return { recovered: false, action: "journal-discarded", payload: null };
      }
      const mainFingerprint = fingerprintOf(model, main.value);
      const journalFingerprint = fingerprintOf(model, journal.ok ? journal.value : null);
      if (journalFingerprint && mainFingerprint === journalFingerprint) {
        storage.removeItem(journalKey);
        return { recovered: false, action: "journal-cleared", payload: migrateToV2(main.value, model) };
      }
      storage.removeItem(journalKey);
      return { recovered: false, action: "journal-discarded", payload: migrateToV2(main.value, model) };
    }

    // 检查点：导入/重建/批量替换/色数优化前创建；内容未变化或已有相同内容检查点时跳过。
    function addCheckpoint(reason, label, payloadBuilder) {
      const base = readPayload();
      if (!base.payload) return null;
      const current = base.payload;
      const existing = Array.isArray(current.checkpoints) ? current.checkpoints : [];
      const currentFingerprint = fingerprintOf(model, current);
      const nextPayload = typeof payloadBuilder === "function" ? payloadBuilder(clone(current)) : clone(current);
      if (!nextPayload) return null;
      if (fingerprintOf(model, nextPayload) === currentFingerprint) return null;
      if (existing.some((item) => item && item.fingerprint === currentFingerprint)) return null;
      const checkpoint = normalizeCheckpoint({ reason, label, at: new Date().toISOString(), fingerprint: currentFingerprint, payload: clone(current) }, model);
      if (!checkpoint) return null;
      nextPayload.checkpoints = [checkpoint].concat(existing).slice(0, MAX_CHECKPOINTS);
      nextPayload.savedAt = new Date().toISOString();
      writePayload(nextPayload);
      return checkpoint;
    }

    function listCheckpoints() {
      const base = readPayload();
      if (!base.payload) return [];
      return (Array.isArray(base.payload.checkpoints) ? base.payload.checkpoints : [])
        .map((item) => normalizeCheckpoint(item, model))
        .filter(Boolean);
    }

    function restoreCheckpoint(checkpointId) {
      const base = readPayload();
      if (!base.payload) return null;
      const checkpoints = Array.isArray(base.payload.checkpoints) ? base.payload.checkpoints : [];
      const target = checkpoints.find((item) => item && item.id === String(checkpointId));
      if (!target || !target.payload) return null;
      const restored = migrateToV2(clone(target.payload), model);
      restored.checkpoints = checkpoints.filter((item) => item && item.id !== String(checkpointId) && item.payload);
      restored.savedAt = new Date().toISOString();
      writePayload(restored);
      return restored;
    }

    return Object.freeze({
      STORE_VERSION,
      PAYLOAD_VERSION: PAYLOAD_VERSION_2,
      mainKey,
      journalKey,
      readPayload,
      writePayload,
      recover,
      addCheckpoint,
      listCheckpoints,
      restoreCheckpoint
    });
  }

  return Object.freeze({ STORE_VERSION, PAYLOAD_VERSION_2, MAX_CHECKPOINTS, CHECKPOINT_REASONS, migrateToV2, createMemoryStorage, wrapLocalStorage, createStore, normalizeCheckpoint, makeCheckpoint });
});
