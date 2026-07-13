# Sync Cache Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep Q Pixel project sync usable when browser localStorage cannot store the full project list.

**Architecture:** Add an in-memory project cache in `web/app.js`. `getProjects()` reads localStorage on first load, then prefers the in-memory cache after any sync/save. `setProjects()` and manual sync write to memory first and treat localStorage quota errors as cache-only, not as sync failure.

**Tech Stack:** Plain JavaScript, current `/api/projects` service, existing browser test page.

---

### Task 1: Memory Cache Fallback

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`

- [ ] Add `state.projectCache` and `state.projectCacheReady`.
- [ ] Update `getProjects()` to return cache after it has been initialized.
- [ ] Add `storeProjectsLocally(projects)` that writes memory first, then best-effort localStorage.
- [ ] Update `setProjects()` and `syncProjectsFromRemote()` to use the helper.

### Task 2: Test Coverage

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`
- Modify: `/Users/mac/GitHub/q-pixel/web/test.html`

- [ ] Expose test hooks for forcing local project storage failure and clearing project cache.
- [ ] Add a browser test proving project lists still merge and remain readable when localStorage write fails.

### Task 3: Verify And Sync Desktop

**Files:**
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/app.js`
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/test.html`

- [ ] Run `node --check web/app.js`.
- [ ] Run browser regression page through local service.
- [ ] Copy verified web files into desktop app resources.
- [ ] Commit and push to GitHub.
