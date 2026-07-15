# Q像素 AI 创作辅助 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 AI 生图升级为主题导演、多方案对比、结构修复和配色设计的一体化创作流程。

**Architecture:** 在现有 AI 生成弹窗内增加创作摘要和候选区，服务端保持现有单图生成接口兼容；客户端按候选图片维护临时状态，选择后复用现有导入向导。结构修复与配色方案使用本地算法，保证没有远程 AI 时仍可工作。

**Tech Stack:** 原生 HTML/CSS/JavaScript、现有 Python AI 服务、Canvas、现有 MARD 色板和 QPixel 测试页。

---

### Task 1: 扩展 AI 生成请求和创作摘要

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html:1106-1138`
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js:2700-2790`

- [x] Add editable controls for composition, palette direction, and generation count, defaulting to one generation and preserving existing provider fields.
- [x] Add `buildAiCreativeBrief()` that combines prompt, style, dimensions, color limit, composition, and palette requirements into a readable summary.
- [x] Add a preview-only brief panel and update it on relevant input changes.
- [x] Keep `buildAiGenerationRequest()` backward compatible by adding `creativeBrief` and `candidateCount` fields without removing existing fields.
- [x] Run `node --check web/app.js` and confirm the existing AI modal still opens.

### Task 2: Implement multi-candidate generation and selection

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html:1120-1140`
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js:2790-2860`
- Modify: `/Users/mac/GitHub/q-pixel/web/styles.css:3226-3335`

- [x] Add an in-memory `aiCandidateState` containing request, candidates, and selected index.
- [x] Generate candidates sequentially when count is greater than one, passing a deterministic variation suffix to the request prompt.
- [x] Render each returned data URL in a candidate tile with select and compare actions.
- [x] Apply only the selected candidate through `applyAiImageDataUrl`; closing the modal leaves the current canvas unchanged.
- [x] Retain successful candidates when a later candidate fails.
- [x] Run the QPixel test page and a browser smoke test for candidate controls.

### Task 3: Add local structural repair preview

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js` near existing `repairSymmetryGaps`, `cleanPixelArtPattern`, and import assistant functions.
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html` near the candidate action area.
- Modify: `/Users/mac/GitHub/q-pixel/web/styles.css` near AI modal styles.

- [x] Reuse the existing pattern quality and locked-role analysis for candidate diagnostics.
- [x] Apply the existing conservative cleanup and symmetry repair only after the user clicks “结构修复预览”, preserving locked colors.
- [x] Replace the temporary candidate preview only after explicit repair confirmation; the original remains available by regenerating the candidate.
- [x] Display changed-cell, isolated-cell, low-frequency-color, and protected-color summaries.
- [x] Verify repair is temporary until the candidate is applied to the existing import flow.

### Task 4: Add palette designer presets

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html` near AI candidate actions.
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js` near color optimization helpers.
- Modify: `/Users/mac/GitHub/q-pixel/web/styles.css` near AI styles.

- [x] Add palette preset controls through the existing palette direction field and candidate palette action.
- [x] Implement local palette variants using the existing MARD palette reduction and distance functions.
- [x] Preserve locked outline and highlight codes in every variant.
- [x] Render each variant's color count and keep the final import wizard available for detailed difficulty checks.
- [x] Make the selected palette preview the candidate image without changing the current canvas until apply.

### Task 5: Verify, sync, and release

**Files:**
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/app.js`
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/index.html`
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/styles.css`

- [x] Run `node --check web/app.js`, Python compilation, and `git diff --check`.
- [x] Run `agent-browser` against `http://127.0.0.1:8765/` and `http://127.0.0.1:8765/test.html`; verify no overlay, candidate controls render, and test page reports `PASS`.
- [x] Copy web assets to the desktop app resource directory and restart the local sync server.
- [x] Confirm source and desktop resources are byte-identical.
- [ ] Commit with a focused feature message and push `main`.
