"use strict";

const assert = require("node:assert/strict");
const projectModel = require("../web/core/project-model.js");
const fixtures = require("./fixtures/project-payloads.js");

let idSequence = 0;
const fixedNow = "2026-09-22T12:00:00.000Z";
const cachedPayloads = new Map();
const model = projectModel.createContext({
  makeId: () => `test-id-${++idSequence}`,
  now: () => fixedNow,
  onPayload: (id, payload) => cachedPayloads.set(id, payload)
});

const payload = fixtures.small();
const reordered = {
  pattern: payload.pattern,
  title: "另一个标题",
  id: "another-id",
  savedAt: "2026-09-23T00:00:00.000Z",
  createdAt: "2025-01-01T00:00:00.000Z",
  editorSettings: payload.editorSettings,
  exportRegions: payload.exportRegions,
  exportSettings: payload.exportSettings,
  buildProgress: payload.buildProgress,
  activeLayerId: payload.activeLayerId,
  layers: payload.layers,
  palette: payload.palette,
  type: payload.type,
  app: payload.app,
  version: payload.version
};
assert.equal(projectModel.payloadFingerprint(payload), projectModel.payloadFingerprint(reordered), "元数据和键顺序不应改变内容指纹");

const migrated = projectModel.migratePayload({ id: "legacy", pattern: { width: 1, height: 1, cells: [["A1"]] } });
assert.equal(migrated.version, 1, "旧项目应迁移到当前 payload 版本");

const normalized = model.normalizeProject({ payload });
assert.equal(normalized.id, payload.id);
assert.equal(normalized.width, 8);
assert.equal(normalized.height, 8);
assert.equal(normalized.historyCount, 0);
assert.equal(cachedPayloads.get(payload.id), payload);

const editedPayload = JSON.parse(JSON.stringify(payload));
editedPayload.pattern.cells[0][0] = "H7";
editedPayload.savedAt = fixedNow;
const withHistory = model.withProjectHistory({
  id: payload.id,
  title: payload.title,
  savedAt: fixedNow,
  updatedAt: fixedNow,
  payload: editedPayload
}, normalized);
assert.equal(withHistory.history.length, 1, "覆盖保存前应保留一版历史");
assert.equal(withHistory.history[0].fingerprint, projectModel.payloadFingerprint(payload));
assert.equal(withHistory.history[0].source, "manual");

const restoredAt = "2026-09-22T13:00:00.000Z";
const restored = model.restoreProjectHistoryVersion(withHistory, withHistory.history[0].id, restoredAt);
assert.ok(restored, "历史版本应可恢复");
assert.equal(restored.payload.id, payload.id);
assert.equal(restored.payload.savedAt, restoredAt);
assert.equal(restored.history.length, 2, "恢复前的当前版本也应进入历史");
assert.equal(restored.versionSource, "restore");
assert.equal(restored.history[0].source, "manual");
const afterRestoreEdit = JSON.parse(JSON.stringify(restored.payload));
afterRestoreEdit.pattern.cells[0][1] = "A2";
const savedAfterRestore = model.withProjectHistory({ id: payload.id, title: payload.title, payload: afterRestoreEdit }, restored);
assert.equal(savedAfterRestore.history[0].source, "restore", "恢复形成的正式版本应标明来源");

const baseFingerprint = projectModel.payloadFingerprint(payload);
const localPayload = JSON.parse(JSON.stringify(payload));
localPayload.pattern.cells[0][0] = "A2";
const remotePayload = JSON.parse(JSON.stringify(payload));
remotePayload.pattern.cells[0][0] = "A3";
assert.equal(model.hasMeaningfulPayloadConflict(
  { payload: localPayload, syncFingerprint: baseFingerprint },
  { payload: remotePayload, syncFingerprint: baseFingerprint }
), true, "同一同步基线上的双向修改应产生冲突");

const conflictCopy = model.makeConflictCopy({ id: "original", title: "作品", payload: remotePayload });
assert.notEqual(conflictCopy.id, "original");
assert.equal(conflictCopy.conflictOf, "original");
assert.match(conflictCopy.title, /冲突副本$/);
assert.equal(conflictCopy.payload.id, conflictCopy.id);

for (const [name, makeFixture] of Object.entries(fixtures)) {
  const fixture = makeFixture();
  const normalizedFixture = model.normalizeProject({ payload: fixture });
  assert.equal(normalizedFixture.width, fixture.pattern.width, `${name} 宽度往返失败`);
  assert.equal(normalizedFixture.height, fixture.pattern.height, `${name} 高度往返失败`);
  assert.equal(normalizedFixture.payload.pattern.cells.length, fixture.pattern.height, `${name} 行数错误`);
  assert.equal(normalizedFixture.payload.pattern.cells[0].length, fixture.pattern.width, `${name} 列数错误`);
  assert.match(projectModel.payloadFingerprint(fixture), /^fp-[0-9a-f]{8}-\d+$/);
}

console.log("project-payload tests: PASS");
