(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelProjectModel = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const CURRENT_PAYLOAD_VERSION = 1;
  const MAX_HISTORY = 12;

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function defaultMakeId() {
    return `qpx-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function defaultNow() {
    return new Date().toISOString();
  }

  function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value && typeof value === "object") {
      return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
  }

  function migratePayload(payload) {
    if (!payload || typeof payload !== "object") return null;
    if (payload.version != null) return payload;
    return Object.assign({ version: CURRENT_PAYLOAD_VERSION }, payload);
  }

  function meaningfulPayload(payload) {
    if (!payload || typeof payload !== "object") return null;
    const copy = clone(payload);
    delete copy.savedAt;
    delete copy.createdAt;
    delete copy.title;
    delete copy.id;
    return copy;
  }

  function payloadFingerprint(payload) {
    const text = stableStringify(meaningfulPayload(payload));
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `fp-${(hash >>> 0).toString(16).padStart(8, "0")}-${text.length}`;
  }

  function createContext(options) {
    const settings = options || {};
    const makeId = typeof settings.makeId === "function" ? settings.makeId : defaultMakeId;
    const now = typeof settings.now === "function" ? settings.now : defaultNow;
    const onPayload = typeof settings.onPayload === "function" ? settings.onPayload : function () {};

    function normalizeProjectHistory(history) {
      return Array.isArray(history)
        ? history
          .filter((item) => item && item.payload && item.fingerprint)
          .map((item) => ({
            id: item.id || makeId(),
            title: item.title || "未命名",
            savedAt: item.savedAt || now(),
            source: item.source === "restore" ? "restore" : "manual",
            thumbnail: typeof item.thumbnail === "string" ? item.thumbnail : "",
            fingerprint: item.fingerprint,
            payload: item.payload
          }))
          .slice(0, MAX_HISTORY)
        : [];
    }

    function normalizeProject(project) {
      const input = project && typeof project === "object" ? project : {};
      const payload = input.payload || null;
      const history = normalizeProjectHistory(input.history);
      const currentTime = now();
      const createdAt = input.createdAt || (payload && payload.createdAt) || input.savedAt || currentTime;
      const savedAt = input.savedAt || (payload && payload.savedAt) || currentTime;
      const updatedAt = input.updatedAt || savedAt;
      const id = input.id || (payload && payload.id) || makeId();
      if (payload) onPayload(id, payload);
      return Object.assign({}, input, {
        id,
        title: input.title || (payload && payload.title) || "未命名",
        createdAt,
        savedAt,
        updatedAt,
        width: input.width || (payload && payload.pattern && payload.pattern.width) || 0,
        height: input.height || (payload && payload.pattern && payload.pattern.height) || 0,
        thumbnail: input.thumbnail || "",
        editSeconds: Math.max(0, Number(input.editSeconds || 0)),
        openCount: Math.max(0, Number(input.openCount || 0)),
        designDates: input.designDates && typeof input.designDates === "object" ? input.designDates : {},
        syncFingerprint: input.syncFingerprint || (payload ? payloadFingerprint(payload) : ""),
        payloadUpdatedAt: input.payloadUpdatedAt || (payload ? (payload.savedAt || updatedAt) : ""),
        remoteUpdatedAt: input.remoteUpdatedAt || "",
        remoteSyncFingerprint: input.remoteSyncFingerprint || "",
        historyCount: Math.max(history.length, Number(input.historyCount || 0)),
        history,
        payload
      });
    }

    function makeProjectVersion(project) {
      if (!project || !project.payload) return null;
      return {
        id: makeId(),
        title: project.title || project.payload.title || "未命名",
        savedAt: project.savedAt || project.payload.savedAt || now(),
        source: project.versionSource === "restore" ? "restore" : "manual",
        thumbnail: project.thumbnail || "",
        fingerprint: payloadFingerprint(project.payload),
        payload: clone(project.payload)
      };
    }

    function withProjectHistory(nextProject, existingProject) {
      const next = normalizeProject(nextProject);
      const existing = existingProject ? normalizeProject(existingProject) : null;
      const history = normalizeProjectHistory((existing && existing.history) || next.history);
      const nextFingerprint = payloadFingerprint(next.payload);
      next.syncFingerprint = next.syncFingerprint || (existing && existing.syncFingerprint) || (existing && existing.payload ? payloadFingerprint(existing.payload) : nextFingerprint);
      if (existing && existing.payload) {
        const previousFingerprint = payloadFingerprint(existing.payload);
        const alreadyLatest = history[0] && history[0].fingerprint === previousFingerprint;
        if (previousFingerprint !== nextFingerprint && !alreadyLatest) {
          const version = makeProjectVersion(existing);
          if (version) history.unshift(version);
        }
      }
      next.history = history.slice(0, MAX_HISTORY);
      return next;
    }

    function restoreProjectHistoryVersion(project, versionId, restoredAt) {
      const current = normalizeProject(project);
      const version = normalizeProjectHistory(current.history).find((item) => item.id === versionId);
      if (!current.payload || !version || !version.payload) return null;
      const savedAt = restoredAt || now();
      const payload = clone(version.payload);
      payload.id = current.id;
      payload.title = current.title || payload.title || "未命名";
      payload.createdAt = current.createdAt || payload.createdAt || savedAt;
      payload.savedAt = savedAt;
      return withProjectHistory({
        id: current.id,
        title: payload.title,
        createdAt: current.createdAt || payload.createdAt,
        savedAt,
        updatedAt: savedAt,
        width: payload.pattern && payload.pattern.width,
        height: payload.pattern && payload.pattern.height,
        thumbnail: current.thumbnail || "",
        versionSource: "restore",
        editSeconds: current.editSeconds,
        openCount: current.openCount,
        designDates: current.designDates,
        payload
      }, current);
    }

    function hasMeaningfulPayloadConflict(existing, incoming) {
      if (!existing || !incoming || !existing.payload || !incoming.payload) return false;
      const existingFingerprint = payloadFingerprint(existing.payload);
      const incomingFingerprint = payloadFingerprint(incoming.payload);
      if (existingFingerprint === incomingFingerprint) return false;
      const base = existing.syncFingerprint || incoming.syncFingerprint || "";
      if (!base) return false;
      return existingFingerprint !== base && incomingFingerprint !== base;
    }

    function makeConflictCopy(project) {
      const currentTime = now();
      const copy = normalizeProject(clone(project));
      const originalId = copy.id;
      copy.id = makeId();
      copy.title = `${copy.title || "未命名"} 冲突副本`;
      copy.createdAt = currentTime;
      copy.savedAt = currentTime;
      copy.updatedAt = currentTime;
      copy.openCount = 0;
      copy.conflictOf = originalId;
      copy.syncFingerprint = copy.payload ? payloadFingerprint(copy.payload) : copy.syncFingerprint;
      if (copy.payload) {
        copy.payload.id = copy.id;
        copy.payload.title = copy.title;
        copy.payload.createdAt = currentTime;
        copy.payload.savedAt = currentTime;
      }
      return copy;
    }

    return Object.freeze({
      hasMeaningfulPayloadConflict,
      makeConflictCopy,
      makeProjectVersion,
      meaningfulPayload,
      migratePayload,
      normalizeProject,
      normalizeProjectHistory,
      payloadFingerprint,
      restoreProjectHistoryVersion,
      stableStringify,
      withProjectHistory
    });
  }

  return Object.freeze({
    CURRENT_PAYLOAD_VERSION,
    MAX_HISTORY,
    createContext,
    meaningfulPayload,
    migratePayload,
    payloadFingerprint,
    stableStringify
  });
});
