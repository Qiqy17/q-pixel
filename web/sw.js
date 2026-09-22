const CACHE_NAME = "q-pixel-v20260922-module-boundary-1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./feature-flags.js",
  "./module-loader.js",
  "./core/project-model.js",
  "./core/workspace-state.js",
  "./core/dom-utils.js",
  "./workspaces/quality-checks.js",
  "./workspaces/context-inspector.js",
  "./workspaces/workspace-controller.js",
  "./import/import-router.js",
  "./pattern-rebuild/rebuild-engine.js",
  "./pattern-rebuild/rebuild-worker.js",
  "./pattern-rebuild/legend-schema.js",
  "./import-engine.js",
  "./import-processing.js",
  "./import-worker.js",
  "./app.js",
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
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("./offline.html")))
  );
});
