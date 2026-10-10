(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelSaveStatus = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  function describe({ dirty, saving, failed, savedAt, pending, syncing, syncError, conflict, hasPayload, syncConfirmed }) {
    const local = dirty ? saving ? "保存中" : failed ? "保存失败·修改未保存" : "未保存" : hasPayload ? "已保存到本机" : "尚未保存到本机";
    let remote = syncError ? "同步未完成" : syncing ? "同步中" : pending ? "待同步" : hasPayload ? syncConfirmed ? "已同步" : "尚未确认同步" : dirty ? "尚未同步" : "尚未下载到本机";
    if (conflict) remote += "·存在冲突副本";
    if (dirty && !pending && hasPayload && syncConfirmed && !syncing && !syncError) remote = "上次保存版本已同步";
    return { local, remote, savedAt: savedAt || "" };
  }
  return Object.freeze({ describe });
});
