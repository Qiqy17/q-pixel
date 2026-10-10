(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelProjectLibrary = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const MAX_BYTES = 50 * 1024 * 1024, MAX_RECORDS = 1000;
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const stable = (v) => Array.isArray(v) ? `[${v.map(stable).join(",")}]` : v && typeof v === "object"
    ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}` : JSON.stringify(v);
  const bytes = (v) => new TextEncoder().encode(typeof v === "string" ? v : JSON.stringify(v));
  async function digest(v) {
    if (!globalThis.crypto?.subtle) throw new Error("此入口不支持备份校验，请使用电脑 App、本机或 HTTPS 入口。");
    return Array.from(new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", bytes(stable(v))))).map((n) => n.toString(16).padStart(2, "0")).join("");
  }
  function safeRecord(record) {
    const next = clone(record);
    for (const key of ["serverRevision", "localRevision", "pendingSync", "remoteUpdatedAt", "remoteSyncFingerprint", "lastSyncedAt", "offlinePayloadFingerprint", "_lastMutation", "_lastDigest"]) delete next[key];
    return next;
  }
  function validCells(cells, width, height) {
    return Array.isArray(cells) && cells.length === height && cells.every((row) => Array.isArray(row) && row.length === width && row.every((cell) => cell === null || (typeof cell === "string" && cell.length > 0 && cell.length <= 64)));
  }
  function validatePayload(payload) {
    if (!payload || ![1, 2].includes(payload.version == null ? 1 : payload.version)) throw new Error("不支持的作品版本");
    const p = payload.pattern;
    if (!p || !Number.isInteger(p.width) || !Number.isInteger(p.height) || p.width < 16 || p.height < 16 || p.width > 500 || p.height > 500 || !validCells(p.cells, p.width, p.height)) throw new Error("图纸尺寸或格子数据不完整");
    if (payload.layers != null && (!Array.isArray(payload.layers) || payload.layers.some((layer) => !layer || !layer.id || !validCells(layer.cells, p.width, p.height)))) throw new Error("图层数据不完整");
    if (payload.layers && new Set(payload.layers.map((layer) => layer.id)).size !== payload.layers.length) throw new Error("图层 ID 重复");
    if (payload.activeLayerId && payload.layers?.length && !payload.layers.some((layer) => layer.id === payload.activeLayerId)) throw new Error("活动图层引用无效");
    if (payload.checkpoints != null && !Array.isArray(payload.checkpoints)) throw new Error("检查点数据无效");
    for (const layer of payload.layers || []) if (layer.contentCells) {
      const h = layer.contentCells.length, w = layer.contentCells[0]?.length;
      if (!Number.isInteger(w) || w < 1 || w > 500 || h > 500 || !validCells(layer.contentCells, w, h)) throw new Error("画布外图层正文不完整");
    }
    return payload;
  }
  function validateRecord(record) {
    if (!record || typeof record.id !== "string" || !record.id || record.id.length > 240 || /[\\/]/.test(record.id)) throw new Error("作品 ID 无效");
    validatePayload(record.payload);
    if (record.payload.id && record.payload.id !== record.id) throw new Error("正文 ID 与作品 ID 不一致");
    if (record.history != null && !Array.isArray(record.history)) throw new Error("历史数据无效");
    for (const entry of record.history || []) { if (!entry || !entry.id) throw new Error("历史引用无效"); validatePayload(entry.payload); }
    return record;
  }
  function prepare({ records, draft, omitted = [], pendingIds = [], source = "本机作品库" }) {
    if (records.length > MAX_RECORDS) throw new Error("单包最多 1000 个作品，请选择子集分批备份。");
    const items = [], missing = clone(omitted);
    let estimatedBytes = 0;
    for (const original of records) {
      if (original.purged) { missing.push({ id: original.id, reason: "永久删除记录（不包含正文）" }); continue; }
      if (!original.payload) { missing.push({ id: original.id, title: original.title, reason: "尚未下载到本机" }); continue; }
      const record = safeRecord(original);
      validateRecord(record);
      estimatedBytes += bytes(record).length;
      if (estimatedBytes > MAX_BYTES) throw new Error("备份超过 50 MiB，请选择子集分批备份。");
      if ((record.historyCount || 0) > (record.history || []).length) missing.push({ id: record.id, reason: "部分历史尚未读取" });
      items.push({ record, sourcePending: pendingIds.includes(record.id), checksum: "0".repeat(64) });
    }
    if (draft) validatePayload(draft);
    const library = { format: "qpxlib", version: 1, exportedAt: new Date().toISOString(), source,
      items, draft: draft ? { payload: clone(draft), checksum: "0".repeat(64) } : null, omitted: missing };
    library.checksum = "0".repeat(64);
    return library;
  }
  function capacityOf(library) {
    const size = bytes(JSON.stringify(library)).length;
    if (size > MAX_BYTES) throw new Error("备份超过 50 MiB，请减少勾选内容或分批备份；单作品可使用顶部“备份 .qpx”（不含完整历史）。");
    return { bytes: size, count: library.items.length, omitted: library.omitted, partial: library.omitted.length > 0 };
  }
  function preflight(options) { return capacityOf(prepare(options)); }
  function chooseBatch(records) {
    const emptyBytes = preflight({ records: [] }).bytes;
    let size = emptyBytes, count = 0, omittedCount = 0;
    const ids = [], skipped = [];
    for (const record of records) {
      try {
        const single = preflight({ records: [record] });
        const nextSize = size + single.bytes - emptyBytes + (count && single.count ? 1 : 0) + (omittedCount && single.omitted.length ? 1 : 0);
        if (ids.length >= MAX_RECORDS || nextSize > MAX_BYTES) { skipped.push(record.id); continue; }
        ids.push(record.id); size = nextSize; count += single.count; omittedCount += single.omitted.length;
      } catch (_) { skipped.push(record.id); }
    }
    return { ids, skipped, bytes: size };
  }
  async function create(options) {
    const library = prepare(options);
    capacityOf(library);
    for (const item of library.items) item.checksum = await digest(item.record);
    if (library.draft) library.draft.checksum = await digest(library.draft.payload);
    const { checksum, ...body } = library;
    library.checksum = await digest(body);
    const text = JSON.stringify(library);
    if (bytes(text).length > MAX_BYTES) throw new Error("备份超过 50 MiB，请选择子集分批备份。");
    return { library, text, partial: library.omitted.length > 0 };
  }
  async function inspect(text) {
    if (bytes(text).length > MAX_BYTES) throw new Error("文件超过 50 MiB，请使用分批备份文件。");
    let data;
    try { data = JSON.parse(text); } catch (_) { throw new Error("作品库文件无法解析"); }
    if (data.format !== "qpxlib" || data.version !== 1 || !Array.isArray(data.items) || data.items.length > MAX_RECORDS || !Array.isArray(data.omitted)) throw new Error("不支持的作品库格式");
    const { checksum, ...body } = data;
    const packageValid = checksum === await digest(body);
    const valid = [], invalid = [], ids = new Set();
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      try {
        validateRecord(item.record);
        if (item.checksum !== await digest(item.record)) throw new Error("校验摘要不一致");
        if (ids.has(item.record.id)) throw new Error("文件包含重复作品 ID");
        ids.add(item.record.id); valid.push(item.record);
      } catch (error) { invalid.push({ index: i, id: item?.record?.id || "未知", reason: error.message }); }
    }
    let draft = null;
    if (data.draft) {
      try {
        validatePayload(data.draft.payload);
        if (data.draft.checksum !== await digest(data.draft.payload)) throw new Error("草稿校验失败");
        draft = data.draft.payload;
      } catch (error) { invalid.push({ id: "恢复草稿", reason: error.message }); }
    }
    // A damaged package manifest cannot silently become a complete migration.
    if (!packageValid) invalid.push({ id: "清单", reason: "整体校验不一致；只能明确选择校验通过的内容" });
    return { valid, invalid, draft, omitted: data.omitted, packageValid };
  }
  function equivalent(record) {
    const clean = safeRecord(record);
    for (const key of ["updatedAt", "savedAt", "createdAt", "openCount", "editSeconds", "designDates", "syncFingerprint", "payloadUpdatedAt", "hasPayload", "hasThumbnail", "historyCount"]) delete clean[key];
    return stable(clean);
  }
  function reidentify(record, id, title) {
    record.id = id; record.title = title;
    record.payload.id = id; record.payload.title = title;
    for (const history of record.history || []) { history.payload.id = id; }
    for (const checkpoint of record.payload.checkpoints || []) if (checkpoint.payload) checkpoint.payload.id = id;
    delete record.serverRevision; delete record.localRevision; delete record.purged;
    return record;
  }
  function plan(inspection, existing, makeId = () => `qpx-migrated-${globalThis.crypto.randomUUID()}`) {
    const byId = new Map(existing.map((r) => [r.id, r])), records = [];
    const report = { createdAt: new Date().toISOString(), added: [], skipped: [], copies: [], trash: [], drafts: [], omitted: clone(inspection.omitted), invalid: clone(inspection.invalid) };
    for (const source of inspection.valid) {
      let record = safeRecord(source), old = byId.get(record.id);
      if (old && equivalent(old) === equivalent(record)) { report.skipped.push(record.id); continue; }
      if (old) {
        const originalId = record.id;
        record = reidentify(record, makeId(), `${record.title || "未命名"} 迁移副本`);
        record.migrationSourceId = originalId;
        report.copies.push({ sourceId: originalId, id: record.id });
      } else report.added.push(record.id);
      if (record.deleted) { record.deletedAt ||= new Date().toISOString(); report.trash.push(record.id); }
      records.push(record); byId.set(record.id, record);
    }
    if (inspection.draft) {
      const payload = clone(inspection.draft), id = makeId(), title = `${payload.title || "未命名"} 恢复草稿`;
      const record = reidentify({ id, title, payload }, id, title);
      records.push(record); report.drafts.push(id);
    }
    if (new Set(records.map((r) => r.id)).size !== records.length || records.some((r) => existing.some((e) => e.id === r.id))) throw new Error("迁移副本 ID 冲突，请重新检查。");
    return { records, report };
  }
  return Object.freeze({ MAX_BYTES, MAX_RECORDS, preflight, chooseBatch, create, inspect, plan, digest, validatePayload, stable });
});
