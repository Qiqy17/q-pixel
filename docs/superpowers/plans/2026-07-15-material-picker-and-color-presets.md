# Material Picker And Color Presets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the long material dropdown with a categorized picker and add reusable color presets without breaking existing designs or the realistic material renderer.

**Architecture:** Keep the existing material values as the persistence contract. Add a small picker state layer that filters the existing material catalog, writes the selected value back to the hidden compatibility select, and stores a separate color preset plus hex color. Reuse `drawStyleBackground()` so preview and PNG export remain identical.

**Tech Stack:** Existing HTML, CSS, vanilla JavaScript, Canvas 2D, local browser regression page, macOS resource bundle sync.

---

### Task 1: Add picker markup and styling

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html` around the style preview controls near `materialBackgroundSelect`
- Modify: `/Users/mac/GitHub/q-pixel/web/styles.css` near existing style preview controls

- [x] Add a compact material picker container with category buttons, material buttons, color preset buttons, custom color input, and a current selection summary.
- [x] Keep `#materialBackgroundSelect` in the DOM but mark it visually hidden for backward compatibility and existing event handlers.
- [x] Add responsive CSS: two-column picker on desktop, stacked sections on narrow screens, no horizontal overflow, selected state with the existing blue accent.
- [x] Run `git diff --check` and inspect the markup for duplicate IDs.

### Task 2: Add picker catalog, category filtering, and color preset state

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js` near `styleBackgroundMaterialGroups`, `cacheElements`, and style control initialization

- [x] Define `styleMaterialColorPresets` with six presets: warm, cool, natural, dark, muted, and light; each contains a label, hex color, and short description.
- [x] Add `styleMaterialPickerCategory` and `styleMaterialColorPreset` to `state.beads`, defaulting to the first available category and `natural`.
- [x] Add element references for category list, material list, color list, custom color input, and summary.
- [x] Implement `renderMaterialPicker()` to show only materials from the selected category, mark the current material, render color swatches, and update the summary.
- [x] Implement `selectMaterialPickerValue(value)` to update the compatibility select, preserve the existing value contract, render the picker, and redraw the preview.
- [x] Implement `selectMaterialColorPreset(key)` to update the stored preset and background color, render the picker, and redraw the preview.
- [x] Add `syncMaterialPickerFromControls()` so loading an old design or changing the legacy select updates the new picker.
- [x] Keep custom background selection separate and show it as a dedicated fallback state.

### Task 3: Connect color presets to rendering and persistence

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js` around style preview settings serialization, restoration, and `drawStyleBackground`

- [x] Change the style preview background color fallback to the selected preset color while respecting an explicit custom color.
- [x] Keep the existing bitmap image, relief map, soft-light tint, specular layer, and edge shading intact; only alter tint inputs.
- [x] Add `materialColorPreset` and `materialColorHex` to saved style preset settings.
- [x] Restore those fields with backward-compatible defaults, then call `syncMaterialPickerFromControls()`.
- [x] Ensure PNG export calls the same `drawMaterialPreview()` path and therefore uses the selected material/color combination.

### Task 4: Wire events and remove redundant interaction

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js` in the style preview event binding block

- [x] Bind category clicks, material clicks, preset clicks, and custom color input changes.
- [x] Keep the legacy material select listener as a compatibility path, but update the new picker whenever it changes.
- [x] Remove only the visible duplicate material dropdown label/control; retain the hidden select for saved files and existing functions.
- [x] Add a concise selection summary rather than adding another help panel or extra buttons.

### Task 5: Verify, sync, and publish

**Files:**
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/app.js`, `index.html`, `styles.css` as needed by the paired-resource sync

- [x] Run `node --check web/app.js`, Python compilation checks, and `git diff --check`.
- [x] Use the browser regression page to verify all catalog values remain available, selecting a category changes the visible material buttons, selecting a color changes the canvas, and the canvas has non-flat pixel variance.
- [x] Open the main page at `http://127.0.0.1:8765/`, verify no error overlay and no horizontal overflow at desktop and narrow viewport widths.
- [x] Copy changed web resources to the desktop app bundle and compare checksums.
- [x] Commit with `feat: improve material picker and color presets` and push `main`.
