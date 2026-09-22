(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelWorkspaceState = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const STAGES = Object.freeze(["design", "color", "make", "output", "version"]);
  const BREAKPOINTS = Object.freeze({ compact: 768, tablet: 1180 });
  const DEFAULT_STATE = Object.freeze({
    stage: "design",
    inspectorOpen: true,
    paletteOpen: true,
    viewport: "desktop"
  });

  function viewportForWidth(width) {
    const value = Number(width);
    if (!Number.isFinite(value) || value >= BREAKPOINTS.tablet) return "desktop";
    if (value >= BREAKPOINTS.compact) return "tablet";
    return "compact";
  }

  function normalize(source) {
    const input = source && typeof source === "object" ? source : {};
    return {
      stage: STAGES.includes(input.stage) ? input.stage : DEFAULT_STATE.stage,
      inspectorOpen: input.inspectorOpen !== false,
      paletteOpen: input.paletteOpen !== false,
      viewport: ["desktop", "tablet", "compact"].includes(input.viewport) ? input.viewport : DEFAULT_STATE.viewport
    };
  }

  function reduce(state, action) {
    const current = normalize(state);
    const event = action && typeof action === "object" ? action : {};
    if (event.type === "set-stage") return Object.assign({}, current, { stage: STAGES.includes(event.stage) ? event.stage : current.stage });
    if (event.type === "set-viewport") return Object.assign({}, current, { viewport: viewportForWidth(event.width) });
    if (event.type === "toggle-inspector") return Object.assign({}, current, { inspectorOpen: !current.inspectorOpen });
    if (event.type === "toggle-palette") return Object.assign({}, current, { paletteOpen: !current.paletteOpen });
    if (event.type === "close-drawers") return Object.assign({}, current, { inspectorOpen: false, paletteOpen: false });
    return current;
  }

  return Object.freeze({ BREAKPOINTS, DEFAULT_STATE, STAGES, normalize, reduce, viewportForWidth });
});
