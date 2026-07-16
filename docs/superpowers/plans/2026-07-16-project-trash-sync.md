# Project Trash Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent deleted projects from reappearing after refresh and provide a synchronized 90-day trash with restore and permanent deletion.

**Architecture:** Store deletion tombstones in the shared project service using the same project ID and a newer `deletedAt`/`updatedAt`. The client filters tombstones from active project lists, imports them into its local trash, and restores by saving a newer active record. Permanent deletion uses a server DELETE endpoint.

**Tech Stack:** Existing vanilla JavaScript client, localStorage, Python HTTP sync servers, browser regression tests.

---

### Task 1: Client tombstones and 90-day trash
- [x] Add deleted-project helpers and extend local trash retention from 30 to 90 days.
- [x] Make delete save a remote tombstone after moving the full project to local trash.
- [x] Ignore deleted projects in active lists and ingest remote tombstones into the local trash.
- [x] Make remote payload loading reject deleted records.

### Task 2: Restore and permanent deletion
- [x] Save a restored active record with a newer timestamp so it supersedes the tombstone.
- [x] Add client remote DELETE handling for permanent deletion.
- [x] Keep the existing recovery UI and update wording to 90 days.

### Task 3: Sync service support
- [x] Preserve newer deleted records during server-side merges and prune tombstones after 90 days.
- [x] Add DELETE `/api/projects/:id` to both sync servers and remove legacy index entries too.

### Task 4: Verify and publish
- [x] Run syntax, Python, diff, and browser regression checks.
- [x] Verify merge behavior: delete tombstone beats stale active record, restore beats tombstone, and permanent delete removes remote data.
- [x] Sync desktop resources, commit, and push `main`.
