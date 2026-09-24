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
    const TOOL_ICONS = {
      brush: '<path d="m5 19 3-7 8-8a2 2 0 0 1 3 3l-8 8-6 4Z"/><path d="m8 12 4 4"/><circle cx="18" cy="17" r="1"/>',
      picker: '<path d="m7 16 9-9 2 2-9 9-3 1 1-3Z"/><path d="m14 7 2-2a2 2 0 0 1 3 3l-2 2"/><path d="M4 21h6"/>',
      eraser: '<path d="m4 15 8-9a2 2 0 0 1 3 0l5 5a2 2 0 0 1 0 3l-5 6H9l-5-5Z"/><path d="m9 10 8 8"/>',
      bucket: '<path d="m5 13 6-7 8 7-7 7-7-7Z"/><path d="M4 6h5"/><path d="M18 18c0 2 2 3 2 3s2-1 2-3c0-1-2-4-2-4s-2 3-2 4Z"/>',
      palette: '<path d="M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 1-4 1.5 1.5 0 0 1 1-3h2a4 4 0 0 0 3-4 9 9 0 0 0-9-7Z"/><circle cx="7" cy="10" r="1"/><circle cx="11" cy="7" r="1"/><circle cx="16" cy="8" r="1"/>',
      select: '<rect x="4" y="4" width="16" height="16" rx="3" stroke-dasharray="3 2"/><path d="m11 11 7 5-3 1-1 3-3-9Z"/>',
      'rect-fill': '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 8h8v8H8z" fill="currentColor" opacity=".28"/>',
      'rect-clear': '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 8 8 8m0-8-8 8"/>',
      shape: '<path d="m12 3 9 9-9 9-9-9 9-9Z"/><circle cx="12" cy="12" r="2"/>',
      outline: '<rect x="4" y="4" width="16" height="16" rx="3"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
      'clear-layer': '<path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13"/><path d="m10 11 4 5m0-5-4 5"/>',
      pan: '<path d="M12 3v18M3 12h18m-9-9-3 3m3-3 3 3m-3 15-3-3m3 3 3-3M3 12l3-3m-3 3 3 3m15-3-3-3m3 3-3 3"/>',
      recolor: '<path d="M5 7h14m-3-3 3 3-3 3M19 17H5m3-3-3 3 3 3"/><circle cx="12" cy="12" r="2"/>',
      guide: '<path d="M12 2v20M2 12h20" stroke-dasharray="3 2"/><circle cx="12" cy="12" r="3" fill="currentColor"/>'
    };

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
      const groups = [
        { id: "draw", label: "绘制", tools: ["brush", "picker", "eraser", "bucket", "palette"] },
        { id: "area", label: "区域", tools: ["select", "rect-fill", "rect-clear", "shape", "outline", "clear-layer"] },
        { id: "assist", label: "辅助", tools: ["pan", "recolor", "guide"] }
      ];
      const activeTool = primary.querySelector(".tool-button.active");
      let activeGroup = groups.find((group) => activeTool && group.tools.includes(activeTool.dataset.tool))?.id || "draw";
      const detailsById = new Map();
      groups.forEach((group) => {
        const details = documentRef.createElement("details");
        details.className = "tool-rail-group";
        details.dataset.group = group.id;
        details.open = group.id === activeGroup;
        const summary = documentRef.createElement("summary");
        summary.textContent = group.label;
        summary.setAttribute("aria-label", `${group.label}工具`);
        details.appendChild(summary);
        group.tools.forEach((tool) => {
          const button = primary.querySelector(`.tool-button[data-tool="${tool}"]`);
          if (!button) return;
          const icon = documentRef.createElementNS("http://www.w3.org/2000/svg", "svg");
          icon.setAttribute("viewBox", "0 0 24 24");
          icon.setAttribute("aria-hidden", "true");
          icon.classList.add("tool-svg-icon");
          icon.innerHTML = TOOL_ICONS[tool] || "";
          const label = Array.from(button.childNodes).filter((node) => node.nodeType === 3).map((node) => node.textContent).join("").trim();
          Array.from(button.childNodes).filter((node) => node.nodeType === 3).forEach((node) => node.remove());
          const text = documentRef.createElement("span");
          text.className = "tool-button-label";
          text.textContent = label || button.title || tool;
          button.prepend(icon, text);
          button.classList.add("has-svg-icon");
          details.appendChild(button);
        });
        if (group.id === "draw") {
          const recent = primary.querySelector(".recent-color-stack");
          if (recent) details.appendChild(recent);
        }
        primary.appendChild(details);
        detailsById.set(group.id, details);
        details.addEventListener("toggle", () => {
          if (!details.open) return;
          activeGroup = group.id;
          detailsById.forEach((other, id) => { if (id !== group.id) other.open = false; });
        });
      });
      primary.addEventListener("click", (event) => {
        const button = event.target.closest(".tool-button");
        if (!button) return;
        const details = button.closest(".tool-rail-group");
        if (details && !details.open) details.open = true;
      });
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
