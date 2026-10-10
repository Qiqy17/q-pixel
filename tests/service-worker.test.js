"use strict";
const assert = require("node:assert/strict"), fs = require("node:fs"), vm = require("node:vm");
const Response = globalThis.Response || class {
  constructor(body) { this.body = body; this.ok = true; this.type = "default"; }
  async text() { return this.body; }
  clone() { return new Response(this.body); }
  static error() { const response = new Response(null); response.type = "error"; return response; }
};
const source = fs.readFileSync(require.resolve("../web/sw.js"), "utf8");
const currentCache = source.match(/const CACHE_NAME = "([^"]+)"/)[1];
const handlers = {}, deleted = [], requests = [];
let offline = false;
const cache = { addAll: async () => {}, put: async () => {}, match: async (request) => request === "./offline.html" ? new Response("offline page") : null };
const self = { QPixelMaterialLibrary: { items: [] }, location: { origin: "https://qa.invalid" }, clients: { claim: async () => {} }, skipWaiting: async () => {}, addEventListener: (type, handler) => { handlers[type] = handler; } };
vm.runInNewContext(source, {
  self, importScripts() {}, URL, Response,
  caches: { open: async () => cache, keys: async () => ["q-pixel-vold", currentCache, "other-app"], delete: async (key) => deleted.push(key) },
  fetch: async (request) => { requests.push(request); if (offline) throw Error("offline"); return new Response("network"); }
});
async function event(type, request) {
  let result;
  handlers[type]({ request, waitUntil: (promise) => { result = promise; }, respondWith: (promise) => { result = promise; } });
  return result;
}
(async () => {
  await event("install"); await event("activate");
  assert.deepEqual(deleted, ["q-pixel-vold"], "activation preserves unrelated apps and current cache");
  assert.equal(await event("fetch", {method:"GET",url:"https://external.invalid/image.png"}),undefined);
  assert.equal(await event("fetch", {method:"GET",url:"https://qa.invalid/api/projects"}),undefined);
  offline = true;
  assert.equal((await event("fetch", {method:"GET",url:"https://qa.invalid/missing.js",mode:"cors"})).type,"error", "missing script must not receive HTML");
  assert.equal(await (await event("fetch", {method:"GET",url:"https://qa.invalid/missing",mode:"navigate"})).text(),"offline page");
  console.log("service-worker: scoped cache cleanup, API isolation and offline fallbacks passed");
})().catch(error => { console.error(error); process.exitCode=1; });
