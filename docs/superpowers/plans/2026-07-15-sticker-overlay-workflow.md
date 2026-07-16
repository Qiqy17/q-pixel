# Sticker Overlay Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make uploaded style stickers immediately appear on the preview canvas and provide reliable select, drag, resize, duplicate, opacity, delete, save, and export behavior.

**Architecture:** Keep the existing sticker library separate from canvas overlays. Every uploaded library item will also create a `styleOverlays` sticker object, while clicking a library thumbnail creates another object. Reuse the existing overlay hit-testing, drag rendering, style preset serialization, and PNG export path.

**Tech Stack:** Existing HTML, CSS, vanilla JavaScript, Canvas 2D, browser regression page.

---

### Task 1: Add explicit overlay controls

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html`
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`

- [x] Add a `复制选中贴纸` button beside the existing delete button.
- [x] Add the element reference and bind the click event.
- [x] Keep the existing thumbnail click path for adding another sticker.

### Task 2: Fix upload-to-canvas flow

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`

- [x] Make `addStickerOverlay` return the created overlay and optionally accept an index offset.
- [x] After each uploaded sticker is stored in the library, create a corresponding canvas overlay with a staggered position.
- [x] Select the last uploaded overlay, redraw after the image loads, and report how many stickers were placed.
- [x] Preserve the library-only behavior for existing stored stickers until the user clicks them.

### Task 3: Implement duplicate and robust controls

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`

- [x] Add `duplicateSelectedSticker()` to clone the selected sticker data, offset its position, assign a new ID, and select it.
- [x] Keep width and height synchronized when the size slider changes.
- [x] Keep opacity synchronized and update labels when selection changes.
- [x] Ensure deleting a selected sticker clears selection and redraws without affecting the library.

### Task 4: Verify and publish

**Files:**
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/app.js`, `index.html`, `styles.css` as needed

- [x] Run syntax, Python, and diff checks.
- [x] Verify the main page creates a visible sticker overlay after an upload-like add operation, supports duplicate/delete, and keeps non-flat canvas output.
- [x] Verify style preset serialization contains sticker overlays and PNG export uses the same canvas.
- [x] Sync the desktop bundle, commit, and push `main`.
