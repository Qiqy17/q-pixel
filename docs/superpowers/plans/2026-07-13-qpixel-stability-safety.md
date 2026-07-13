# QPixel Stability Safety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add first-pass product safety for QPixel saves and syncs through project history, conflict-copy preservation, and a local service health endpoint.

**Architecture:** Keep the current file-backed sync model. Add browser-side payload fingerprinting and history snapshots around existing project save/merge paths, and add `/api/health` to both Python sync services.

**Tech Stack:** Plain JavaScript frontend, browser localStorage, Python `http.server`-based local sync services, existing `web/test.html` regression harness.

---

### Task 1: Project History Helpers

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`
- Test: `/Users/mac/GitHub/q-pixel/web/test.html`

- [ ] Add stable JSON stringification, payload fingerprinting, history normalization, and snapshot helpers near the existing project persistence helpers.
- [ ] Preserve `history` and `syncFingerprint` in `normalizeProject`.
- [ ] Update tests so normalizing a project with history keeps the history entries.

### Task 2: Save-Time Version History

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`
- Test: `/Users/mac/GitHub/q-pixel/web/test.html`

- [ ] Update `saveCurrentProject` to add the previous payload into history when the current payload changed.
- [ ] Skip duplicate history entries when the fingerprint is unchanged.
- [ ] Add test hooks for building project records from old/new payloads.
- [ ] Add tests for changed-save history and unchanged-save no-op history.

### Task 3: Conflict Copy Merge

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`
- Test: `/Users/mac/GitHub/q-pixel/web/test.html`

- [ ] Update `mergeProjects` so same-id conflicting payloads are not silently lost.
- [ ] Keep the newest record as the main project.
- [ ] Create a duplicate conflict copy for the older differing payload.
- [ ] Preserve payload/history when a summary-only project is merged.
- [ ] Add regression tests for conflict copy and summary merge behavior.

### Task 4: Local Service Health Endpoint

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/scripts/qpixel_ipad_https_server.py`
- Modify: `/Users/mac/GitHub/q-pixel/scripts/qpixel_sync_server.py`
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`
- Test: `/Users/mac/GitHub/q-pixel/web/test.html`

- [ ] Add `GET /api/health` to both Python services.
- [ ] Report project/settings readability, project count, data file size, backup count, and timestamp.
- [ ] Add frontend health status parsing helpers and test hooks.
- [ ] Improve manual sync status text when health is available.

### Task 5: Verification, Desktop Sync, Push

**Files:**
- Copy changed frontend/service files into `/Users/mac/Desktop/Q像素.app/Contents/Resources`

- [ ] Run `node --check web/app.js`.
- [ ] Run `python3 -m py_compile` on both service scripts.
- [ ] Run browser regression from repo source.
- [ ] Copy changed files into the desktop app resources.
- [ ] Restart only the QPixel service on port `8766`.
- [ ] Verify `/api/health`, `/api/projects/index`, and `/api/projects/<id>`.
- [ ] Run browser regression through `http://127.0.0.1:8766/test.html`.
- [ ] Commit and push to `Qiqy17/q-pixel`.
