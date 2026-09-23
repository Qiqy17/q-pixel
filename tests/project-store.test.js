"use strict";
const assert = require("node:assert/strict");
const storeModule = require("../web/core/project-store.js");
const modelModule = require("../web/core/project-model.js");

const model = modelModule.createContext();

function makeV1Payload(seed) {
  return {
    version: 1,
    app: "Q像素",
    type: "bead-pattern",
    id: "p1",
    title: `项目${seed}`,
    createdAt: "2026-01-01T00:00:00.000Z",
    sourceLabel: "测试图",
    savedAt: "2026-01-02T00:00:00.000Z",
    palette: "Mard-221",
    pattern: { width: 4, height: 3, cells: [["A1", "A1", null, "A2"], ["A1", "A2", "A2", null], [null, null, "A1", "A1"]] },
    layers: [{ id: "l1", name: "图层 1", visible: true, locked: false, cells: [["A1", "A1", null, "A2"], ["A1", "A2", "A2", null], [null, null, "A1", "A1"]] }],
    activeLayerId: "l1",
    buildProgress: { "0:0": true }
  };
}

// v1 → v2 迁移无损：原字段保留，新增容器补齐。
const v1 = makeV1Payload(1);
const v2 = storeModule.migrateToV2(v1, model);
assert.equal(v2.version, 2);
assert.equal(v2.title, "项目1");
assert.deepEqual(v2.pattern.cells, v1.pattern.cells);
assert.equal(v2.importSource.type, "unknown");
assert.equal(v2.importSource.label, "测试图");
assert.equal(v2.rebuildReport, null);
assert.deepEqual(v2.checkpoints, []);
assert.equal(v1.version, 1, "迁移不得修改输入");

// 已是 v2 的载荷原样返回（引用一致）。
const again = storeModule.migrateToV2(v2, model);
assert.equal(again, v2);

// 读写往返。
const storage = storeModule.createMemoryStorage();
const store = storeModule.createStore({ storage, projectId: "p1", model });
store.writePayload(v2);
const read = store.readPayload();
assert.equal(read.payload.version, 2);
assert.equal(read.payload.title, "项目1");
assert.equal(read.corrupted, false);

// 损坏 JSON：不抛异常，报告 corrupted。
storage.corrupt(store.mainKey);
const corrupted = store.readPayload();
assert.equal(corrupted.payload, null);
assert.equal(corrupted.corrupted, true);

// 写入配额不足：日志已写、主键写失败时，旧主键保持完整，日志残留可被恢复流程清理。
// 注意：指纹排除标题（重命名不算内容变化），因此用真正不同的格子内容制造差异。
const storage2 = storeModule.createMemoryStorage();
const store2 = storeModule.createStore({ storage: storage2, projectId: "p2", model });
store2.writePayload(makeV1Payload(2));
const before = storage2.getItem(store2.mainKey);
const newer = makeV1Payload(3);
newer.pattern.cells[0][0] = "B9";
storage2.failNextSetsOn(store2.mainKey);
assert.throws(() => store2.writePayload(newer), /QuotaExceeded/);
assert.equal(storage2.getItem(store2.mainKey), before, "配额失败时主键保持旧完整值");
// 恢复：日志与主键指纹不同 → 丢弃日志，保留主键。
const recovery1 = store2.recover();
assert.equal(recovery1.action, "journal-discarded");
assert.equal(recovery1.recovered, false);
assert.equal(store2.readPayload().payload.pattern.cells[0][0], "A1");

// 崩溃前滚：主键损坏但日志完整 → 从日志恢复。
const storage3 = storeModule.createMemoryStorage();
const store3 = storeModule.createStore({ storage: storage3, projectId: "p3", model });
const goodPayload = storeModule.migrateToV2(makeV1Payload(3), model);
storage3.setItem(store3.journalKey, JSON.stringify(goodPayload));
storage3.setItem(store3.mainKey, "{broken");
const recovery2 = store3.recover();
assert.equal(recovery2.recovered, true);
assert.equal(recovery2.action, "rolled-forward");
assert.equal(store3.readPayload().payload.title, "项目3");

// 主键与日志一致 → 清理日志即完成事务。
const storage4 = storeModule.createMemoryStorage();
const store4 = storeModule.createStore({ storage: storage4, projectId: "p4", model });
const samePayload = storeModule.migrateToV2(makeV1Payload(4), model);
storage4.setItem(store4.mainKey, JSON.stringify(samePayload));
storage4.setItem(store4.journalKey, JSON.stringify(samePayload));
const recovery3 = store4.recover();
assert.equal(recovery3.action, "journal-cleared");
assert.equal(storage4.getItem(store4.journalKey), null);
assert.equal(store4.readPayload().payload.title, "项目4");

// 检查点：创建、去重、恢复、上限。
const storage5 = storeModule.createMemoryStorage();
const store5 = storeModule.createStore({ storage: storage5, projectId: "p5", model });
store5.writePayload(storeModule.migrateToV2(makeV1Payload(5), model));
const checkpoint = store5.addCheckpoint("import", "导入前", (payload) => {
  payload.pattern.cells[0][0] = "B1";
  return payload;
});
assert.ok(checkpoint);
assert.equal(checkpoint.reason, "import");
assert.equal(checkpoint.payload.pattern.cells[0][0], "A1", "检查点保存的是操作前内容");
assert.equal(store5.readPayload().payload.pattern.cells[0][0], "B1", "操作后内容已写入");
const list1 = store5.listCheckpoints();
assert.equal(list1.length, 1);

// 内容未变化时不建点。
const duplicate = store5.addCheckpoint("import", "无变化", (payload) => payload);
assert.equal(duplicate, null);
assert.equal(store5.listCheckpoints().length, 1);

// 恢复检查点：内容回到操作前，检查点被消耗。
const restored = store5.restoreCheckpoint(list1[0].id);
assert.equal(restored.pattern.cells[0][0], "A1");
assert.equal(store5.readPayload().payload.pattern.cells[0][0], "A1");
assert.equal(store5.listCheckpoints().length, 0);

// 检查点上限 MAX_CHECKPOINTS。
const storage6 = storeModule.createMemoryStorage();
const store6 = storeModule.createStore({ storage: storage6, projectId: "p6", model });
store6.writePayload(storeModule.migrateToV2(makeV1Payload(6), model));
for (let index = 0; index < 8; index += 1) {
  store6.addCheckpoint("manual", `第${index}次`, (payload) => {
    payload.pattern.cells[0][1] = `C${index}`;
    return payload;
  });
}
assert.equal(store6.listCheckpoints().length, storeModule.MAX_CHECKPOINTS);
assert.deepEqual(storeModule.CHECKPOINT_REASONS, ["import", "rebuild", "batch-replace", "color-optimize", "manual"]);
console.log("project-store tests: PASS");
