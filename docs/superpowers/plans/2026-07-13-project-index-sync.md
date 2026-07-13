# Project Index Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce Q Pixel sync payload size by loading a lightweight project list first and full project files only when opened.

**Architecture:** Extend the local Python sync servers with `/api/projects/index` and `/api/projects/<id>` while keeping `/api/projects` compatible. Update the web app to prefer the index endpoint, cache payloads in memory, fetch missing payloads on open/import/duplicate, and save the current project through the single-project endpoint.

**Tech Stack:** Plain JavaScript, Python `http.server`, existing JSON project store, browser regression page.

---

### Task 1: Sync Server Endpoints

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/scripts/qpixel_ipad_https_server.py`
- Modify: `/Users/mac/GitHub/q-pixel/scripts/qpixel_sync_server.py`

- [ ] Add project summary helpers that omit `payload` and include lightweight metadata.
- [ ] Add `GET /api/projects/index`.
- [ ] Add `GET /api/projects/<id>`.
- [ ] Add `POST /api/projects/<id>` for single-project upsert.
- [ ] Keep existing `GET/POST /api/projects` behavior for older clients.

### Task 2: Frontend Indexed Loading

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`

- [ ] Add an in-memory payload cache keyed by project id.
- [ ] Make remote sync prefer `/api/projects/index` with fallback to `/api/projects`.
- [ ] Fetch full payload on project open, layer import, and duplicate when the summary lacks it.
- [ ] Save the current project through `POST /api/projects/<id>` to avoid uploading the full list.

### Task 3: Tests And Desktop Sync

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/test.html`
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/app.js`
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/test.html`
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/qpixel_ipad_https_server.py`

- [ ] Add browser hook coverage for summary projects and payload cache.
- [ ] Run Python compile checks.
- [ ] Run `node --check web/app.js`.
- [ ] Run browser regression.
- [ ] Copy verified files into the desktop app resource folder.
- [ ] Commit and push.
