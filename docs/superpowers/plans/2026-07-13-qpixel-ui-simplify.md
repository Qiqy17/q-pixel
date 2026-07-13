# QPixel UI Simplify Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make QPixel feel cleaner and more mature without adding new UI complexity.

**Architecture:** Keep the existing layout and behavior. Remove obvious duplicate markup, tune shared visual tokens, reduce button/card heaviness, and add lightweight project safety badges.

**Tech Stack:** Existing static HTML/CSS/JS, current browser test harness.

---

### Task 1: Remove Low-Risk Redundancy

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html`
- Modify: `/Users/mac/GitHub/q-pixel/web/styles.css`

- [ ] Remove the duplicated nested `colorStrip` container.
- [ ] Remove repeated CSS declarations in `profile-avatar` and `shape-min-hint`.

### Task 2: Visual Polish Without Workflow Changes

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/styles.css`
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html`

- [ ] Tighten global radius/shadow/color tokens.
- [ ] Make topbar slimmer and canvas area more prominent.
- [ ] Make right-side cards softer and less visually heavy.
- [ ] Rename the top export button to a broader `导出`.
- [ ] De-emphasize `样式预览` as a secondary display action.

### Task 3: Project Safety Cues

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`
- Modify: `/Users/mac/GitHub/q-pixel/web/styles.css`

- [ ] Add small project badges for history and conflict copies on home/project lists.
- [ ] Keep badges informational only; no new modal in this pass.

### Task 4: Verify And Sync Desktop App

**Files:**
- Copy changed files to `/Users/mac/Desktop/Q像素.app/Contents/Resources`

- [ ] Run syntax and diff checks.
- [ ] Run browser regression from repo source.
- [ ] Copy changed files into desktop resources.
- [ ] Run browser regression through `http://127.0.0.1:8766/test.html`.
- [ ] Commit and push.
