(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelRebuildWorkbench = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function byId(document, id) { return document.getElementById(id); }

  function create(options) {
    const document = options.document;
    const engine = options.engine;
    const modal = byId(document, "rebuildModal");
    const sourceCanvas = byId(document, "rebuildSourceCanvas");
    const resultCanvas = byId(document, "rebuildResultCanvas");
    const status = byId(document, "rebuildStatus");
    const confidence = byId(document, "rebuildConfidence");
    const issueList = byId(document, "rebuildIssueList");
    const issueFilter = byId(document, "rebuildIssueFilter");
    const applyButton = byId(document, "rebuildApplyButton");
    const analyzeButton = byId(document, "rebuildAnalyzeButton");
    const closeButton = byId(document, "rebuildCloseButton");
    const cancelButton = byId(document, "rebuildCancelButton");
    const boundarySelect = byId(document, "rebuildBoundarySelect");
    const controls = {
      rotation: byId(document, "rebuildRotationInput"),
      cellWidth: byId(document, "rebuildCellWidthInput"),
      cellHeight: byId(document, "rebuildCellHeightInput"),
      offsetX: byId(document, "rebuildOffsetXInput"),
      offsetY: byId(document, "rebuildOffsetYInput"),
      columns: byId(document, "rebuildColumnsInput"),
      rows: byId(document, "rebuildRowsInput"),
      colorTolerance: byId(document, "rebuildColorToleranceInput")
    };
    const cornerControls = Array.from({ length: 4 }, (_, index) => ({ x: byId(document, `rebuildCorner${index}X`), y: byId(document, `rebuildCorner${index}Y`) }));
    let session = null;
    let imageInput = null;
    let result = null;
    let worker = null;
    let taskSerial = 0;
    let selectedCell = null;
    let candidates = [];

    function setBusy(active, message) {
      modal && modal.classList.toggle("is-processing", Boolean(active));
      if (status) status.textContent = message || (active ? "正在分析网格与颜色…" : "等待分析");
      if (analyzeButton) analyzeButton.disabled = Boolean(active);
      if (applyButton) applyButton.disabled = Boolean(active) || !result;
    }

    function stopTask() {
      taskSerial += 1;
      if (worker) worker.terminate();
      worker = null;
      setBusy(false, result ? "已取消本轮分析，保留上次结果。" : "分析已取消，当前设计未改变。");
    }

    function imageToInput(image) {
      const sourceWidth = image.naturalWidth || image.width;
      const sourceHeight = image.naturalHeight || image.height;
      const scale = Math.min(1, 1600 / Math.max(sourceWidth, sourceHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return { canvas, imageData: context.getImageData(0, 0, canvas.width, canvas.height) };
    }

    function readNumber(control, fallback) {
      if (!control || control.value === "") return fallback;
      const value = Number(control.value);
      return Number.isFinite(value) ? value : fallback;
    }

    function readOptions() {
      let boundary = null;
      const boundaryIndex = boundarySelect ? Number(boundarySelect.value) : -1;
      if (boundaryIndex >= 0 && candidates[boundaryIndex]) boundary = candidates[boundaryIndex];
      const hasAllCorners = cornerControls.every((point) => point.x && point.y && point.x.value !== "" && point.y.value !== "");
      return {
        rotation: readNumber(controls.rotation, 0),
        cellWidth: readNumber(controls.cellWidth, 0) || undefined,
        cellHeight: readNumber(controls.cellHeight, 0) || undefined,
        offsetX: readNumber(controls.offsetX, 0),
        offsetY: readNumber(controls.offsetY, 0),
        columns: readNumber(controls.columns, 0) || undefined,
        rows: readNumber(controls.rows, 0) || undefined,
        colorTolerance: readNumber(controls.colorTolerance, 14),
        boundary,
        corners: hasAllCorners ? cornerControls.map((point) => ({ x: readNumber(point.x, 0), y: readNumber(point.y, 0) })) : undefined
      };
    }

    function colorHex(color) {
      if (!color) return "#ffffff";
      return `#${[color.r, color.g, color.b].map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0")).join("")}`;
    }

    function hexColor(value) {
      const match = /^#([0-9a-f]{6})$/i.exec(value || "");
      if (!match) return null;
      return { r: parseInt(match[1].slice(0, 2), 16), g: parseInt(match[1].slice(2, 4), 16), b: parseInt(match[1].slice(4, 6), 16) };
    }

    function drawSource() {
      if (!sourceCanvas || !imageInput) return;
      const context = sourceCanvas.getContext("2d");
      let preview = { data: new Uint8ClampedArray(imageInput.imageData.data), width: imageInput.imageData.width, height: imageInput.imageData.height };
      if (result && engine) {
        const settings = readOptions();
        preview = engine.rotateImage({ data: preview.data }, preview.width, preview.height, settings.rotation || 0);
        if (settings.boundary) {
          const boundary = settings.boundary;
          const corners = [{ x: boundary.left, y: boundary.top }, { x: boundary.right, y: boundary.top }, { x: boundary.right, y: boundary.bottom }, { x: boundary.left, y: boundary.bottom }];
          preview = engine.warpQuadrilateral({ data: preview.data }, preview.width, preview.height, corners, boundary.right - boundary.left + 1, boundary.bottom - boundary.top + 1);
        }
        if (Array.isArray(settings.corners) && settings.corners.length === 4) {
          preview = engine.warpQuadrilateral({ data: preview.data }, preview.width, preview.height, settings.corners, preview.width, preview.height);
        }
      }
      sourceCanvas.width = preview.width;
      sourceCanvas.height = preview.height;
      const previewImage = context.createImageData(preview.width, preview.height);
      previewImage.data.set(preview.data);
      context.putImageData(previewImage, 0, 0);
      if (!result) return;
      const grid = result.grid;
      const scaleX = sourceCanvas.width / Math.max(1, result.processedWidth || result.width);
      const scaleY = sourceCanvas.height / Math.max(1, result.processedHeight || result.height);
      context.save();
      context.strokeStyle = "rgba(49,87,213,.74)";
      context.lineWidth = Math.max(1, 1 / Math.max(scaleX, scaleY));
      for (let column = 0; column <= grid.columns; column += 1) {
        const x = (grid.offsetX + column * grid.cellWidth) * scaleX;
        context.beginPath(); context.moveTo(x, 0); context.lineTo(x, sourceCanvas.height); context.stroke();
      }
      for (let row = 0; row <= grid.rows; row += 1) {
        const y = (grid.offsetY + row * grid.cellHeight) * scaleY;
        context.beginPath(); context.moveTo(0, y); context.lineTo(sourceCanvas.width, y); context.stroke();
      }
      context.restore();
    }

    function drawResult() {
      if (!resultCanvas || !result) return;
      const cellSize = clamp(Math.floor(720 / Math.max(result.grid.columns, result.grid.rows)), 3, 22);
      resultCanvas.width = result.grid.columns * cellSize;
      resultCanvas.height = result.grid.rows * cellSize;
      const context = resultCanvas.getContext("2d");
      context.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
      result.cells.forEach((row, rowIndex) => row.forEach((cell, columnIndex) => {
        context.fillStyle = cell.color ? colorHex(cell.color) : "rgba(0,0,0,0)";
        context.fillRect(columnIndex * cellSize, rowIndex * cellSize, cellSize, cellSize);
        if (cell.confidence < .55 || cell.reason === "transparent") {
          context.strokeStyle = "rgba(216,61,73,.9)";
          context.lineWidth = Math.max(1, cellSize * .12);
          context.strokeRect(columnIndex * cellSize + .5, rowIndex * cellSize + .5, cellSize - 1, cellSize - 1);
        }
      }));
      if (selectedCell) {
        context.strokeStyle = "#3157d5";
        context.lineWidth = Math.max(2, cellSize * .18);
        context.strokeRect(selectedCell.column * cellSize + 1, selectedCell.row * cellSize + 1, cellSize - 2, cellSize - 2);
      }
    }

    function issuesForFilter() {
      if (!result) return [];
      const items = [];
      result.cells.forEach((row, rowIndex) => row.forEach((cell, columnIndex) => {
        if (cell.confidence < .55 || cell.reason === "transparent") items.push({ cell, row: rowIndex, column: columnIndex, type: cell.reason === "transparent" ? "empty" : "color" });
      }));
      const filter = issueFilter ? issueFilter.value : "all";
      return filter === "all" ? items : items.filter((item) => item.type === filter);
    }

    function renderIssues() {
      if (!issueList) return;
      issueList.innerHTML = "";
      if (!result) return;
      const items = issuesForFilter();
      if (!items.length) {
        const empty = document.createElement("p");
        empty.className = "rebuild-empty-state";
        empty.textContent = "当前筛选下没有待复核格子。";
        issueList.appendChild(empty);
        return;
      }
      items.slice(0, 120).forEach((item) => {
        const row = document.createElement("div");
        row.className = "rebuild-issue-row";
        row.dataset.row = item.row;
        row.dataset.column = item.column;
        const label = document.createElement("button");
        label.type = "button";
        label.className = "rebuild-cell-focus";
        label.textContent = `${item.row + 1} 行 ${item.column + 1} 列 · ${item.type === "empty" ? "疑似空格" : `置信度 ${Math.round(item.cell.confidence * 100)}%`}`;
        label.addEventListener("click", () => { selectedCell = item; drawResult(); });
        const color = document.createElement("input");
        color.type = "color";
        color.title = "修正此格颜色";
        color.value = colorHex(item.cell.color);
        color.addEventListener("input", () => {
          item.cell.color = hexColor(color.value);
          item.cell.reason = "manual-review";
          item.cell.confidence = 1;
          drawResult();
        });
        const clear = document.createElement("button");
        clear.type = "button";
        clear.className = "rebuild-cell-clear";
        clear.textContent = "设为空格";
        clear.addEventListener("click", () => {
          item.cell.color = null;
          item.cell.reason = "manual-empty";
          item.cell.confidence = 1;
          renderIssues();
          drawResult();
        });
        row.append(label, color, clear);
        issueList.appendChild(row);
      });
      if (items.length > 120) {
        const note = document.createElement("p");
        note.className = "rebuild-empty-state";
        note.textContent = `为保证流畅，仅显示前 120 个；应用前仍会保留全部 ${items.length} 个识别结果。`;
        issueList.appendChild(note);
      }
    }

    function syncResult(nextResult) {
      result = nextResult;
      candidates = Array.isArray(result.boundaryCandidates) ? result.boundaryCandidates : [];
      if (boundarySelect && boundarySelect.options.length <= 1) {
        candidates.forEach((candidate, index) => {
          const option = document.createElement("option");
          option.value = String(index);
          option.textContent = candidate.id === "content" ? "内容边界" : candidate.id === "inset" ? "轻微内缩" : "完整画面";
          boundarySelect.appendChild(option);
        });
      }
      controls.cellWidth.value = Math.round(result.grid.cellWidth * 100) / 100;
      controls.cellHeight.value = Math.round(result.grid.cellHeight * 100) / 100;
      controls.offsetX.value = Math.round(result.grid.offsetX * 100) / 100;
      controls.offsetY.value = Math.round(result.grid.offsetY * 100) / 100;
      controls.columns.value = result.grid.columns;
      controls.rows.value = result.grid.rows;
      const lowConfidence = result.cells.reduce((count, row) => count + row.filter((cell) => cell.confidence < .55 || cell.reason === "transparent").length, 0);
      if (confidence) confidence.textContent = `总置信度 ${Math.round(result.confidence * 100)}% · ${result.grid.columns} × ${result.grid.rows} 格 · ${result.clusters.length} 种原始颜色 · ${lowConfidence} 格待复核`;
      setBusy(false, lowConfidence ? "分析完成，请优先检查红框格子。" : "分析完成，可以应用为新项目副本。");
      drawSource();
      drawResult();
      renderIssues();
    }

    function analyze() {
      if (!session || !imageInput || !engine) return;
      stopTask();
      result = null;
      selectedCell = null;
      setBusy(true, "正在分析网格、边界和单元格颜色…");
      const id = `rebuild-${++taskSerial}`;
      const currentSerial = taskSerial;
      const input = {
        data: new Uint8ClampedArray(imageInput.imageData.data),
        width: imageInput.imageData.width,
        height: imageInput.imageData.height,
        options: readOptions()
      };
      if (typeof Worker !== "undefined" && options.workerUrl) {
        try {
          worker = new Worker(options.workerUrl);
          worker.onmessage = (event) => {
            const message = event.data || {};
            if (currentSerial !== taskSerial || message.id !== id) return;
            worker.terminate(); worker = null;
            if (message.type === "result") syncResult(message.result);
            else setBusy(false, `分析失败：${message.error || "未知错误"}`);
          };
          worker.onerror = () => {
            if (currentSerial !== taskSerial) return;
            worker.terminate(); worker = null;
            setBusy(false, "后台分析失败，请调整参数后重试。");
          };
          worker.postMessage({ type: "analyze", id, image: { data: input.data }, width: input.width, height: input.height, options: input.options });
          return;
        } catch (_) { worker = null; }
      }
      setTimeout(() => {
        if (currentSerial !== taskSerial) return;
        try { syncResult(engine.analyze({ data: input.data }, input.width, input.height, input.options)); }
        catch (error) { setBusy(false, `分析失败：${error.message || error}`); }
      }, 16);
    }

    function close(notify) {
      stopTask();
      if (modal) modal.classList.add("hidden");
      const previous = session;
      session = null;
      imageInput = null;
      result = null;
      candidates = [];
      if (notify && previous && typeof options.onCancel === "function") options.onCancel(previous);
    }

    function open(nextSession) {
      if (!modal || !nextSession || !nextSession.image) return false;
      session = nextSession;
      imageInput = imageToInput(nextSession.image);
      result = null;
      candidates = [];
      selectedCell = null;
      Object.values(controls).forEach((control) => { if (control) control.value = control === controls.colorTolerance ? "14" : ""; });
      cornerControls.forEach((point) => { if (point.x) point.x.value = ""; if (point.y) point.y.value = ""; });
      if (controls.rotation) controls.rotation.value = "0";
      if (boundarySelect) boundarySelect.innerHTML = '<option value="-1">自动检测（不裁切）</option>';
      if (issueFilter) issueFilter.value = "all";
      const fileName = byId(document, "rebuildFileName");
      if (fileName) fileName.textContent = nextSession.name || "未命名图片";
      modal.classList.remove("hidden");
      drawSource();
      analyze();
      return true;
    }

    if (analyzeButton) analyzeButton.addEventListener("click", analyze);
    if (issueFilter) issueFilter.addEventListener("change", renderIssues);
    if (closeButton) closeButton.addEventListener("click", () => close(true));
    if (cancelButton) cancelButton.addEventListener("click", () => close(true));
    if (modal) modal.addEventListener("click", (event) => { if (event.target === modal) close(true); });
    if (applyButton) applyButton.addEventListener("click", () => {
      if (!result || !session || typeof options.onApply !== "function") return;
      const accepted = options.onApply(result, session, readOptions());
      if (accepted !== false) close(false);
    });

    return Object.freeze({ open, close: () => close(true), analyze, cancel: stopTask, getResult: () => result });
  }

  return Object.freeze({ create });
});
