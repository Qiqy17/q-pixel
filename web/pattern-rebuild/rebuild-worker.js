"use strict";
importScripts("./rebuild-engine.js");
const cancelled = new Set();
self.addEventListener("message", (event) => {
  const message = event.data || {};
  if (message.type === "cancel") { cancelled.add(message.id); return; }
  if (message.type !== "analyze" || !message.id) return;
  try {
    const result = self.QPixelRebuildEngine.analyze(message.image, message.width, message.height, message.options);
    if (!cancelled.has(message.id)) self.postMessage({ type: "result", id: message.id, result });
  } catch (error) {
    if (!cancelled.has(message.id)) self.postMessage({ type: "error", id: message.id, error: error.message || String(error) });
  } finally { cancelled.delete(message.id); }
});
