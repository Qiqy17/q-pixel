# Conservative Restoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make pixel-art restoration preserve imported details, repair only clear outline gaps, and remain safe on repeated clicks.

**Architecture:** Keep the existing import cleaner for initial noise reduction, but make the user-triggered restoration path a separate conservative operation. Track the source pattern used by restoration so the operation is idempotent and can be undone without flattening or re-cleaning the artwork.

**Tech Stack:** Vanilla JavaScript, HTML/CSS, existing QPixel history stack, Playwright browser smoke tests.

---

### Task 1: Separate conservative restoration from import cleanup

**Files:**
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/app.js`
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`

- [ ] Replace `restoreOptimizePattern()` input transformation with a dedicated `restorePixelArtDetails(pattern)` helper that only fills empty or non-outline cells when the same dark outline code is present on opposite sides or on both diagonals.
- [ ] Do not run background cleanup, rare-color replacement, majority smoothing, or palette reduction from the restoration button.
- [ ] Return the original pattern object when no eligible bridge exists, preserving all eye highlights and small color regions.

### Task 2: Make repeated restoration safe and reversible

**Files:**
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/app.js`
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/index.html`

- [ ] Add a restoration fingerprint based on the current pattern cells and clear it whenever a new import or manual pattern edit starts.
- [ ] If the fingerprint matches the last restored pattern, show an informational message and make no history entry.
- [ ] Keep `pushHistory()` before the first actual change so the existing undo control restores the pre-restoration pattern.
- [ ] Update the button label/help text to say that the action only repairs obvious outline gaps and keeps details.

### Task 3: Add regression coverage

**Files:**
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/test.html`

- [ ] Add a pattern fixture containing a dark outline, a light eye highlight, an isolated colored detail, and one clear one-cell outline gap.
- [ ] Assert restoration fills the gap, preserves the highlight/detail, and produces the same result when invoked again.
- [ ] Run syntax validation and the existing browser test page.

### Task 4: Sync, document, and publish

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js`
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html`
- Modify: `/Users/mac/GitHub/q-pixel/web/test.html`
- Modify: `/Users/mac/GitHub/q-pixel/README.zh-CN.md`

- [ ] Copy the verified desktop resources into the repository web mirror.
- [ ] Document that restoration is one-time, conservative, and undoable; color reduction remains a separate explicit action.
- [ ] Commit the focused change and push `main` to `Qiqy17/q-pixel`.

