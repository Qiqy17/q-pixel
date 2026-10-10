importScripts("./studio/scene-material-library.js");
const CACHE_NAME = "q-pixel-v20261010-stability-65";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./styles.css?v=20260928-save-as-45",
  "./feature-flags.js",
  "./module-loader.js",
  "./core/project-model.js",
  "./core/workspace-state.js",
  "./core/dom-utils.js",
  "./core/project-store.js",
  "./core/design-save-as.js",
  "./core/auto-draft.js",
  "./core/offline-projects.js",
  "./core/save-status.js",
  "./core/consumer-flow.js",
  "./core/project-library.js",
  "./core/editor-performance.js",
  "./core/layer-translate.js",
  "./core/layer-order.js",
  "./color/palette-registry.js",
  "./color/inventory-engine.js",
  "./make/board-planner.js",
  "./make/smart-board-export.js",
  "./make/pixdot-protocol.js",
  "./make/smart-board-package.js",
  "./make/smart-board-ui.js",
  "./make/build-navigation.js",
  "./studio/studio.css",
  "./studio/studio.css?v=20261010-consumer-64",
  "./studio/background-engine.js",
  "./studio/background-tool.js",
  "./studio/surface-engine.js",
  "./studio/scene-catalog.js",
  "./studio/scene-material-library.js",
  "./assets/materials/rough_linen_diff_1k.jpg",
  "./assets/materials/synthetic_wood_diff_4k.jpg",
  "./assets/materials/white_plaster_02_diff_1k.jpg",
  "./assets/materials/dark_rock_diff_1k.jpg",
  "./assets/materials/marble_01_diff_4k.jpg",
  "./assets/materials/concrete_diff_4k.jpg",
  ...self.QPixelMaterialLibrary.items.map((item) => item.file),
  "./3d/finish-core.js",
  "./3d/finish-core.js?v=20260926-editor-visibility-17",
  "./3d/calibration-manifest.json",
  "./3d/webgl-support.js",
  "./3d/finish-workbench.js",
  "./3d/finish-workbench.js?v=20260929-h1-3d-opacity-54",
  "./generated/finish-viewer.bundle.js",
  "./generated/finish-viewer.bundle.js?v=20260929-h1-3d-opacity-54",
  "./workspaces/quality-checks.js",
  "./workspaces/context-inspector.js",
  "./workspaces/workspace-controller.js",
  "./workspaces/workspace-controller.js?v=20260927-dual-tool-rails-30",
  "./import/import-router.js",
  "./pattern-rebuild/rebuild-engine.js",
  "./pattern-rebuild/rebuild-worker.js",
  "./pattern-rebuild/legend-schema.js",
  "./pattern-rebuild/rebuild-workbench.js",
  "./import-engine.js",
  "./import-processing.js",
  "./import-worker.js",
  "./app.js",
  "./app.js?v=20261010-consumer-64",
  "./manifest.webmanifest",
  "./icon.svg",
  "./offline.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("q-pixel-v") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || /^\/admin(?:\.|\/|$)/.test(url.pathname)) return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        return cached || (request.mode === "navigate" ? await cache.match("./offline.html") : null) || Response.error();
      }))
  );
});
