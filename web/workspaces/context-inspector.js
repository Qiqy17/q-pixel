(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelContextInspector = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const STAGE_COPY = Object.freeze({
    design: ["设计", "调整结构、画布与图层"],
    color: ["配色", "检查色号、用量与库存"],
    make: ["拼制", "按色号和分区推进制作"],
    output: ["输出", "检查底板、图纸与导出设置"],
    version: ["版本", "保存、历史与同步状态"]
  });

  function create(options) {
    const settings = options || {};
    const documentRef = settings.document || (typeof document !== "undefined" ? document : null);
    const quality = settings.quality;
    let stage = "design";
    let pendingFixes = [];

    function element(id) {
      return documentRef && documentRef.getElementById(id);
    }

    function render(nextStage) {
      stage = STAGE_COPY[nextStage] ? nextStage : stage;
      if (!documentRef || !quality) return [];
      const title = element("workflowInspectorTitle");
      const caption = element("workflowInspectorCaption");
      const list = element("workflowCheckList");
      const summary = element("workflowCheckSummary");
      const fixAll = element("workflowFixAllButton");
      const copy = STAGE_COPY[stage];
      if (title) title.textContent = `${copy[0]}检查`;
      if (caption) caption.textContent = copy[1];
      const checks = quality.forStage(quality.run(settings.getSnapshot ? settings.getSnapshot() : {}), stage);
      pendingFixes = checks.filter((check) => check.action && check.action.type === "fix");
      if (fixAll) {
        fixAll.disabled = pendingFixes.length === 0;
        fixAll.title = pendingFixes.length ? `将处理 ${pendingFixes.length} 项，执行前会再次确认` : "当前没有可安全自动修复的项目";
      }
      if (list) {
        list.replaceChildren();
        checks.forEach((check) => {
          const item = documentRef.createElement("div");
          item.className = `workflow-check workflow-check-${check.status}`;
          item.dataset.checkId = check.id;
          const marker = documentRef.createElement("span");
          marker.className = "workflow-check-marker";
          marker.textContent = check.status === "pass" ? "✓" : check.status === "error" ? "!" : "•";
          const content = documentRef.createElement("div");
          const strong = documentRef.createElement("strong");
          strong.textContent = check.title;
          const detail = documentRef.createElement("p");
          detail.textContent = check.detail;
          content.append(strong, detail);
          item.append(marker, content);
          if (check.action) {
            const button = documentRef.createElement("button");
            button.type = "button";
            button.textContent = check.action.label;
            button.addEventListener("click", () => {
              if (typeof settings.onAction === "function") settings.onAction(check.action);
            });
            item.appendChild(button);
          }
          list.appendChild(item);
        });
      }
      const problems = checks.filter((check) => check.status !== "pass").length;
      if (summary) summary.textContent = problems ? `${problems} 项需要留意` : "当前阶段检查通过";
      return checks;
    }

    function mount() {
      const refresh = element("workflowCheckRefreshButton");
      if (refresh && !refresh.dataset.workflowBound) {
        refresh.dataset.workflowBound = "1";
        refresh.addEventListener("click", () => render(stage));
      }
      const fixAll = element("workflowFixAllButton");
      if (fixAll && !fixAll.dataset.workflowBound) {
        fixAll.dataset.workflowBound = "1";
        fixAll.addEventListener("click", () => {
          if (!pendingFixes.length || typeof settings.onAction !== "function") return;
          const impact = pendingFixes.map((check) => check.title).join("、");
          const confirmed = !documentRef.defaultView || documentRef.defaultView.confirm(`将依次处理：${impact}。确定继续吗？`);
          if (confirmed) settings.onAction({ type: "fix-all", checks: pendingFixes.slice() });
        });
      }
      return render(stage);
    }

    return Object.freeze({ mount, render, getStage: () => stage });
  }

  return Object.freeze({ STAGE_COPY, create });
});
