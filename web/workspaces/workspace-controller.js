(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelWorkspaceController = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function create(options) {
    const settings = options || {};
    const documentRef = settings.document || (typeof document !== "undefined" ? document : null);
    const windowRef = settings.window || (typeof window !== "undefined" ? window : null);
    const stateApi = settings.stateApi;
    let state = stateApi ? stateApi.normalize(settings.initialState) : settings.initialState;
    let mounted = false;
    let inspector = null;

    function setStage(stage) {
      const before = state;
      state = stateApi ? stateApi.reduce(state, { type: "set-stage", stage }) : Object.assign({}, state, { stage });
      if (!documentRef) return state;
      const shell = documentRef.querySelector(".app-shell");
      if (shell) shell.dataset.workflowStage = state.stage;
      documentRef.querySelectorAll("[data-workflow-stage-button]").forEach((button) => {
        const active = button.dataset.workflowStageButton === state.stage;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
        button.tabIndex = active ? 0 : -1;
      });
      if (inspector) inspector.render(state.stage);
      if ((!before || before.stage !== state.stage) && typeof settings.onStateChange === "function") settings.onStateChange(Object.assign({}, state));
      return state;
    }

    function syncViewport() {
      if (!windowRef || !stateApi) return state;
      state = stateApi.reduce(state, { type: "set-viewport", width: windowRef.innerWidth });
      if (documentRef && documentRef.body) documentRef.body.dataset.workspaceViewport = state.viewport;
      if (typeof settings.onStateChange === "function") settings.onStateChange(Object.assign({}, state));
      return state;
    }

    function mergeToolRails() {
      if (!documentRef) return;
      const primary = documentRef.querySelector(".canvas-tool-rail:not(.rail-b)");
      const secondary = documentRef.querySelector(".canvas-tool-rail.rail-b");
      if (!primary || !secondary || primary.dataset.workflowMerged === "1") return;
      Array.from(secondary.querySelectorAll(".tool-button")).forEach((button) => primary.appendChild(button));
      primary.dataset.workflowMerged = "1";
      secondary.classList.add("workflow-rail-merged");
    }

    function mount(contextInspector) {
      if (mounted || !documentRef) return state;
      mounted = true;
      inspector = contextInspector || null;
      documentRef.body.classList.add("professional-workspace");
      const stagebar = documentRef.getElementById("workflowStagebar");
      if (stagebar) stagebar.setAttribute("aria-hidden", "false");
      documentRef.querySelectorAll("[data-workflow-stage-button]").forEach((button) => {
        if (button.dataset.workflowBound) return;
        button.dataset.workflowBound = "1";
        button.addEventListener("click", () => setStage(button.dataset.workflowStageButton));
      });
      mergeToolRails();
      syncViewport();
      if (state && state.viewport !== "desktop" && typeof settings.setInspectorCollapsed === "function") {
        state = stateApi ? stateApi.reduce(state, { type: "close-drawers" }) : Object.assign({}, state, { inspectorOpen: false });
        settings.setInspectorCollapsed(true);
      }
      if (windowRef) windowRef.addEventListener("resize", syncViewport, { passive: true });
      if (inspector) inspector.mount();
      return setStage(state && state.stage || "design");
    }

    return Object.freeze({ getState: () => Object.assign({}, state), mount, setStage, syncViewport });
  }

  return Object.freeze({ create });
});
