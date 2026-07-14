# QPixel Backup Retention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent QPixel local backup files from growing forever while preserving a conservative recovery window.

**Architecture:** Add shared retention helpers to both Python sync services. Run cleanup after creating backups and once during service startup; expose remaining backup count through the existing health endpoint.

**Tech Stack:** Python local sync services, existing static frontend health check.

---

### Task 1: Backup Cleanup Helpers

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/scripts/qpixel_ipad_https_server.py`
- Modify: `/Users/mac/GitHub/q-pixel/scripts/qpixel_sync_server.py`

- [ ] Add retention constants: 30 days, 100 project backups, 30 settings backups.
- [ ] Add helpers to list matching backup files, sort by modification time, and delete only safe `qpixel-projects-*.json` / `qpixel-settings-*.json` files.
- [ ] Keep all files newer than the retention window, then cap older files by count.

### Task 2: Wire Cleanup Into Writes And Startup

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/scripts/qpixel_ipad_https_server.py`
- Modify: `/Users/mac/GitHub/q-pixel/scripts/qpixel_sync_server.py`

- [ ] Run cleanup after backup creation.
- [ ] Run cleanup once at service startup.
- [ ] Add missing backup creation to `qpixel_sync_server.py` before project writes.

### Task 3: Verify And Deploy Locally

**Files:**
- Copy changed service files into `/Users/mac/Desktop/Q像素.app/Contents/Resources`

- [ ] Compile both Python scripts.
- [ ] Run a temporary retention simulation against a temp folder.
- [ ] Copy changed service files into the desktop app resources.
- [ ] Restart only the QPixel 8766 service.
- [ ] Verify `/api/health`.
- [ ] Commit and push.
