# Import Fidelity Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add source comparison, import quality modes, and intelligent color-code locks for better pixel-art import fidelity.

**Architecture:** Keep changes inside the existing single-file web app structure, adding small helpers around import sampling, rendering overlays, and color protection. Mirror the final web files into the desktop app resource folder after verification.

**Tech Stack:** Plain HTML, CSS, browser Canvas, local JavaScript test hooks, Electron-style desktop resource bundle.

---

### Task 1: Document And State

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html`

- [ ] Add state fields for `importMode`, original comparison visibility/opacity, and locked color codes.
- [ ] Add matching element IDs to `cacheElements`.
- [ ] Ensure control synchronization reflects the stored state.

### Task 2: Import Modes

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html`

- [ ] Add segmented import-mode controls to the import dialog.
- [ ] Make direct and calibrated imports read the selected mode.
- [ ] Add `applyImportModeToPattern()` so fidelity keeps raw sampling, balanced uses protected cleanup, and simple uses cleanup plus reduction.

### Task 3: Original Comparison Layer

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html`
- Modify: `/Users/mac/GitHub/q-pixel/web/styles.css`

- [ ] Add bead-panel controls for comparison visibility and opacity.
- [ ] Draw the source image aligned to the bead grid before the bead cells when enabled.
- [ ] Support calibrated and non-calibrated source alignment.

### Task 4: Intelligent Color Locks

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html`

- [ ] Analyze imported patterns for likely outline and highlight colors.
- [ ] Store and display locked colors.
- [ ] Prevent locked colors from being replaced by color optimization and restoration.
- [ ] Expose analysis helpers through `window.QPixelTest`.

### Task 5: Tests And Deployment Sync

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/test.html`
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/app.js`
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/index.html`
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/styles.css`

- [ ] Add tests for import mode labels, comparison settings, color-lock detection, and protected optimization.
- [ ] Run syntax checks and browser tests.
- [ ] Copy verified web files into the desktop app resources.
- [ ] Commit and push to `Qiqy17/q-pixel`.
