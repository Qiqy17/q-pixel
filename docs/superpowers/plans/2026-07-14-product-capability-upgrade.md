# Q像素产品能力升级 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Q像素补齐为从图片导入到备料、制作和灵感生成的完整工作流。

**Architecture:** 复用现有 Canvas、项目同步、历史和 MARD 色卡结构，在前端增加质量分析、库存本地数据、制作进度和 CSV 导出。AI 使用独立 provider-neutral 请求层，未配置服务时只提示状态，不影响离线功能。

**Tech Stack:** 原生 HTML/CSS/JavaScript、Canvas、localStorage、CSV、现有 Python 服务、Playwright。

---

### Task 1: 导入质量检查与原图联动

**Files:** `/Users/mac/GitHub/q-pixel/web/index.html`, `/Users/mac/GitHub/q-pixel/web/app.js`, `/Users/mac/GitHub/q-pixel/web/styles.css`, `/Users/mac/GitHub/q-pixel/web/test.html`

- [ ] Add quality summary and a button that reports total colors, isolated cells, dark-outline cells and locked colors.
- [ ] Keep the current source comparison toggle synchronized after direct and calibrated import.
- [ ] Add tests for a clean pattern and a pattern containing isolated cells.

### Task 2: Color inventory and production CSV

**Files:** same frontend files

- [ ] Store per-code stock counts under `q-pixel-inventory-v1`.
- [ ] Show stock and shortage beside each used color.
- [ ] Add editable inventory inputs and export a UTF-8 BOM CSV material list.
- [ ] Test stock persistence and CSV headers.

### Task 3: Build progress mode

**Files:** same frontend files

- [ ] Add a production-mode toggle and progress counter.
- [ ] In production mode, tapping a cell marks it complete without changing its color.
- [ ] Draw a subtle completion overlay and add clear-progress action.
- [ ] Test toggling and clearing progress.

### Task 4: Project templates and AI entry

**Files:** same frontend files, `/Users/mac/GitHub/q-pixel/scripts/qpixel_sync_server.py` only if a provider proxy is configured later

- [ ] Add a small template section using existing duplicate/current project payload behavior.
- [ ] Add AI generation modal with prompt, style, dimensions and color limit fields.
- [ ] Send a provider-neutral request to a configurable endpoint and show a clear unconfigured state.
- [ ] Test request construction without requiring credentials.

### Task 5: Integration

- [ ] Run `node --check`, `git diff --check`, web tests, desktop tests and responsive checks at 390/768/1440.
- [ ] Sync four frontend files to `/Users/mac/Desktop/Q像素.app/Contents/Resources/`.
- [ ] Commit and push `main`.
