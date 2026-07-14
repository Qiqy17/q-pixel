# OpenAI 生图接入 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Q像素 AI灵感接入 OpenAI GPT Image 2，并把结果自动导入为可编辑像素图纸。

**Architecture:** 前端调用同源 `/api/ai/generate`，不接触密钥；两个本地 Python 服务复用一个 OpenAI 请求模块。服务返回 PNG data URL，前端复用已有图片导入管线处理网格、颜色和对比层。

**Tech Stack:** 原生 JavaScript、Python 标准库 `urllib.request`、OpenAI Images API、现有 Q像素本地 HTTP/HTTPS 服务。

---

### Task 1: Add the server-side OpenAI image client

**Files:**
- Create: `scripts/qpixel_openai.py`
- Test: `python3 -m py_compile scripts/qpixel_openai.py`

- [x] Read `OPENAI_API_KEY`, default model `gpt-image-2`, and default base URL `https://api.openai.com/v1`.
- [x] Validate prompt and target grid dimensions before sending a request.
- [x] Select `1024x1024`, `1536x1024`, or `1024x1536` from the target aspect ratio.
- [x] POST JSON to `/images/generations`, request PNG output, decode `b64_json`, and return a PNG data URL.
- [x] Raise sanitized configuration/request errors without including the secret.

### Task 2: Expose the shared API route in both local services

**Files:**
- Modify: `scripts/qpixel_sync_server.py`
- Modify: `scripts/qpixel_ipad_https_server.py`
- Test: `python3 -m py_compile scripts/qpixel_sync_server.py scripts/qpixel_ipad_https_server.py`

- [x] Route `POST /api/ai/generate` before project routes.
- [x] Reject malformed JSON and invalid prompt/dimension ranges with HTTP 400.
- [x] Return HTTP 503 when the local key is missing and HTTP 502 for upstream failures.
- [x] Return only `{ok, imageDataUrl, model}` on success.

### Task 3: Import generated images in the web app

**Files:**
- Modify: `web/app.js`
- Modify: `web/index.html`
- Modify: `web/test.html`

- [x] Replace endpoint-localStorage behavior with same-origin `/api/ai/generate`.
- [x] Convert returned data URL into an `Image`, set the requested grid size, and reuse `generateBeadsFromImage`.
- [x] Reset stale calibration/progress state, enable source comparison, and mark the result unsaved.
- [x] Show Chinese setup/upstream error messages and preserve the prompt when generation fails.
- [x] Add frontend regression hooks for AI request and data URL application.

### Task 4: Sync desktop resources and document setup

**Files:**
- Create: `docs/OPENAI_SETUP.md`
- Sync: `Contents/Resources/qpixel_openai.py`, `qpixel_sync_server.py`, `qpixel_ipad_https_server.py`, `app.js`, `index.html`, `test.html`

- [x] Document `OPENAI_API_KEY` setup without embedding a real key.
- [x] Copy matching source files into the desktop app resources.
- [x] Verify repository and desktop copies are byte-identical.

### Task 5: Verify and publish

- [x] Run JavaScript, Python, whitespace, and browser tests.
- [x] Verify both local services return the expected missing-key response without making an upstream request.
- [x] Restart the 8766 service so the desktop/pad endpoint uses the new code.
- [x] Commit and push the completed integration to `origin/main`.
