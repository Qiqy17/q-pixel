(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelLayerOrder = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  // The stored order runs back to front; the list is displayed front to back.
  function moveToDisplaySlot(layers, sourceId, slot) {
    if (!Array.isArray(layers) || layers.length < 2) return null;
    const display = layers.slice().reverse();
    const sourceIndex = display.findIndex((layer) => layer.id === sourceId);
    if (sourceIndex < 0 || !Number.isInteger(slot) || slot < 0 || slot >= layers.length) return null;
    const [source] = display.splice(sourceIndex, 1);
    display.splice(slot, 0, source);
    const reordered = display.reverse();
    return reordered.every((layer, index) => layer === layers[index]) ? null : reordered;
  }

  return { moveToDisplaySlot };
});
