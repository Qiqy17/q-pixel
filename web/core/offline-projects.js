(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelOfflineProjects = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  function indexOf(record) {
    const { payload, history, ...index } = record;
    return Object.assign(index, { hasPayload: Boolean(payload), historyCount: Math.max(history?.length || 0, record.historyCount || 0) });
  }

  function fingerprint(record, payloadFingerprint) {
    return JSON.stringify([record.deleted || false, record.title || "", record.folderId || "",
      record.payload ? payloadFingerprint(record.payload) : record.syncFingerprint || ""]);
  }

  function decide(local, remote, baseline, hash) {
    if (!remote) return "upload";
    if (hash(local) === hash(remote)) return "equal";
    if (baseline && hash(remote) === baseline) return "upload";
    return "conflict";
  }

  function conflictCopy(record, suffix) {
    const copy = clone(record);
    copy.id = `${record.id}-conflict-${suffix}`;
    copy.conflictOf = record.id;
    copy.title = `${record.title || "未命名"} 冲突副本`;
    if (copy.payload) { copy.payload.id = copy.id; copy.payload.title = copy.title; }
    delete copy.localRevision;
    return copy;
  }

  function createStore(options) {
    const indexedDB = options.indexedDB;
    const hash = (record) => fingerprint(record, options.payloadFingerprint);
    const indexRecord = (record) => Object.assign(indexOf(record), {
      offlinePayloadFingerprint: record.payload ? options.payloadFingerprint(record.payload) : ""
    });
    let opening;
    let failWrites = false;
    function database() {
      if (!opening) opening = new Promise((resolve, reject) => {
        if (!indexedDB) { reject(new Error("本机作品数据库不可用")); return; }
        const request = indexedDB.open(options.dbName || "q-pixel-projects", 1);
        request.onupgradeneeded = () => {
          for (const name of ["projects", "projectIndex", "outbox", "syncState"]) request.result.createObjectStore(name);
        };
        request.onsuccess = () => {
          const db = request.result;
          db.onversionchange = () => { db.close(); opening = null; };
          resolve(db);
        };
        request.onerror = () => { opening = null; reject(request.error); };
        request.onblocked = () => reject(new Error("请关闭旧版 Q像素页面后重试本机保存"));
      });
      return opening;
    }
    async function transaction(names, mode, action) {
      const db = await database();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(names, mode);
        let result;
        let failure;
        tx.oncomplete = () => resolve(result);
        tx.onabort = tx.onerror = () => reject(failure || tx.error || new Error("本机作品事务中止"));
        const run = (work) => {
          try { work(); } catch (error) { failure = error; tx.abort(); }
        };
        run(() => {
          if (mode === "readwrite" && failWrites) throw new Error("本机作品事务失败（测试）");
          action(tx, (value) => { result = value; }, run);
        });
      });
    }
    function read(name, key) {
      return transaction([name], "readonly", (tx, done) => {
        const request = key == null ? tx.objectStore(name).getAll() : tx.objectStore(name).get(key);
        request.onsuccess = () => done(request.result);
      });
    }
    function save(record, settings = {}) {
      const incoming = clone(record);
      if (!incoming?.id || (!incoming.payload && !incoming.deleted)) return Promise.reject(new Error("作品正文不完整"));
      return transaction(["projects", "projectIndex", "outbox", "syncState"], "readwrite", (tx, done, run) => {
        const projects = tx.objectStore("projects"), outbox = tx.objectStore("outbox");
        const request = projects.get(incoming.id);
        request.onsuccess = () => run(() => {
          const old = request.result;
          const copies = [];
          if (old && settings.expectedRevision != null && old.localRevision !== settings.expectedRevision && hash(old) !== hash(incoming)) {
            const copy = conflictCopy(old, `local-${old.localRevision}`);
            copy.localRevision = 1;
            projects.put(copy, copy.id);
            tx.objectStore("projectIndex").put(indexRecord(copy), copy.id);
            outbox.put({ id: copy.id, revision: 1 }, copy.id);
            copies.push(copy);
          }
          incoming.localRevision = (old?.localRevision || 0) + 1;
          projects.put(incoming, incoming.id);
          tx.objectStore("projectIndex").put(indexRecord(incoming), incoming.id);
          outbox.put({ id: incoming.id, revision: incoming.localRevision }, incoming.id);
          done({ record: incoming, copies });
        });
      });
    }
    // Receiving an index must never replace a locally saved正文 or a pending revision.
    function receive(record, settings = {}) {
      return transaction(["projects", "projectIndex", "outbox", "syncState"], "readwrite", (tx, done, run) => {
        const projects = tx.objectStore("projects"), outbox = tx.objectStore("outbox");
        const oldRequest = projects.get(record.id), pendingRequest = outbox.get(record.id);
        let old, pending, ready = 0;
        const apply = () => run(() => {
          if (++ready < 2) return;
          if (old && (pending || (settings.indexOnly && old.payload))) { done(old); return; }
          const next = Object.assign({}, old || {}, clone(record), { localRevision: (old?.localRevision || 0) + 1 });
          projects.put(next, next.id);
          tx.objectStore("projectIndex").put(indexRecord(next), next.id);
          if (next.payload || next.deleted) tx.objectStore("syncState").put({ fingerprint: hash(next) }, next.id);
          done(next);
        });
        oldRequest.onsuccess = () => { old = oldRequest.result; apply(); };
        pendingRequest.onsuccess = () => { pending = pendingRequest.result; apply(); };
      });
    }
    function seed(record) {
      return transaction(["projects", "projectIndex", "outbox", "syncState"], "readwrite", (tx, done, run) => {
        const projects = tx.objectStore("projects"), request = projects.get(record.id);
        request.onsuccess = () => run(() => {
          if (request.result) { done(request.result); return; }
          const next = Object.assign({}, clone(record), { localRevision: 1 });
          projects.put(next, next.id);
          tx.objectStore("projectIndex").put(indexRecord(next), next.id);
          const knownSynced = next.payload && next.remoteSyncFingerprint === options.payloadFingerprint(next.payload);
          if (knownSynced) tx.objectStore("syncState").put({ fingerprint: hash(next) }, next.id);
          else if (next.payload || next.deleted) tx.objectStore("outbox").put({ id: next.id, revision: 1 }, next.id);
          done(next);
        });
      });
    }
    function acknowledge(id, revision, remote) {
      return transaction(["projects", "outbox", "syncState"], "readwrite", (tx, done, run) => {
        const projects = tx.objectStore("projects"), outbox = tx.objectStore("outbox");
        const request = projects.get(id);
        request.onsuccess = () => run(() => {
          tx.objectStore("syncState").put({ fingerprint: hash(remote) }, id);
          const current = request.result;
          if (current?.localRevision === revision && hash(current) === hash(remote)) {
            outbox.delete(id);
            done(true);
          } else done(false);
        });
      });
    }
    function resolveConflict(id, revision, remote) {
      return transaction(["projects", "projectIndex", "outbox", "syncState"], "readwrite", (tx, done, run) => {
        const projects = tx.objectStore("projects"), request = projects.get(id);
        request.onsuccess = () => run(() => {
          tx.objectStore("syncState").put({ fingerprint: hash(remote) }, id);
          if (request.result?.localRevision !== revision) { done(false); return; }
          const next = Object.assign({}, clone(remote), { localRevision: revision + 1 });
          projects.put(next, id);
          tx.objectStore("projectIndex").put(indexRecord(next), id);
          tx.objectStore("outbox").delete(id);
          done(true);
        });
      });
    }
    return Object.freeze({ hash, save, receive, seed, acknowledge, resolveConflict,
      list: () => read("projectIndex"), get: (id) => read("projects", id), pending: () => read("outbox"),
      baseline: async (id) => (await read("syncState", id))?.fingerprint || "",
      setWriteFailureForTest: (value) => { failWrites = Boolean(value); }
    });
  }
  return Object.freeze({ fingerprint, decide, conflictCopy, createStore });
});
