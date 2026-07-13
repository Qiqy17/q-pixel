# QPixel Stability Safety Design

## Goal

Make QPixel safer for daily use by adding a user-visible safety net around saving, syncing, and local service health. The first stability pass focuses on three outcomes: users can recover older work, simultaneous edits do not silently overwrite each other, and the app can show whether the local sync service is healthy.

## Scope

This design covers:

- Project version history for saved designs.
- Sync conflict detection and copy-preserving conflict handling.
- A lightweight health check endpoint and in-app status summary.

This design does not cover cloud accounts, external database storage, automatic app updates, or a full settings redesign.

## Current Context

QPixel stores projects in browser local storage and syncs with the local desktop service through `/api/projects`, `/api/projects/index`, and `/api/projects/<id>`. The app now fetches a lightweight project index first and loads full project payloads on demand. The desktop service stores the canonical project list in `~/Documents/Q像素/qpixel-projects.json` and already makes timestamped full-file backups before writes.

This is a good base, but it still has three product risks:

- A bad save can replace a good project unless the user manually exports a file.
- If two devices edit the same project, the newest timestamp wins without explaining what happened.
- If sync fails, users only see a generic message instead of knowing whether the service, data file, or network link is the problem.

## User Experience

### Version History

When a user saves a project, QPixel records a compact version snapshot in the project payload. The project list keeps only the latest project as the editable current version, while each project's `history` array keeps recent snapshots.

The first UI pass exposes this through the existing project list/open flow:

- Each project row can show a small version count when history exists.
- Opening a project still opens the latest version by default.
- A restore action can replace the current project with a selected snapshot while keeping the same project id and adding a fresh saved timestamp.

The default retention is conservative: keep the latest 12 versions per project, and skip adding a version when the payload did not meaningfully change.

### Conflict Protection

QPixel treats a conflict as: local and remote have the same project id, both have payloads, both changed since the last local sync baseline, and the payload fingerprints differ.

For this first pass, conflict handling is intentionally copy-preserving:

- Do not silently overwrite either side.
- Keep the newest version as the main project.
- Save the other version as a duplicate titled with `冲突副本`.
- Add a visible message telling the user a conflict copy was preserved.

This is safer than a modal-heavy flow and fits the current UI. A future pass can add a full conflict chooser.

### Health Check

The desktop service adds `GET /api/health`. It returns:

- `ok`: whether the service is running and data files are readable.
- `projectCount`: number of project entries.
- `settingsOk`: whether settings are readable.
- `projectsFileExists`: whether the projects file exists.
- `projectsFileSize`: size in bytes.
- `backupCount`: count of backup files.
- `updatedAt`: server-side timestamp.

The frontend adds a small sync health reader that can be used by manual sync and future UI panels. In this pass, manual sync can show clearer messages such as:

- `同步服务正常，当前有 37 个作品。`
- `同步服务可访问，但作品文件读取异常。`
- `电脑同步服务暂时不可用，已保留当前设备里的文件。`

## Data Model

Project objects may include:

```json
{
  "id": "qpx-...",
  "title": "未命名",
  "savedAt": "2026-07-13T06:09:10.645Z",
  "updatedAt": "2026-07-13T06:09:10.645Z",
  "syncFingerprint": "sha-like-string",
  "payload": {},
  "history": [
    {
      "id": "ver-...",
      "title": "未命名",
      "savedAt": "2026-07-13T06:00:00.000Z",
      "fingerprint": "sha-like-string",
      "payload": {}
    }
  ]
}
```

`history` lives beside the current payload so it moves with a project between desktop, browser, and iPad. The history payloads are complete project payloads because restore must not depend on external files.

To prevent runaway file growth:

- Keep at most 12 history entries per project.
- Keep a version only when the previous current payload fingerprint differs.
- Exclude internal test projects from synced history logic.

## Architecture

### Frontend

`web/app.js` owns:

- Computing stable payload fingerprints.
- Adding a history snapshot before replacing an existing current payload.
- Detecting conflicts during `mergeProjects`.
- Preserving conflicts as duplicate projects instead of overwriting.
- Fetching `/api/health` and turning it into user-friendly status.

The first pass keeps changes close to the existing project save/sync functions: `normalizeProject`, `mergeProjects`, `saveCurrentProject`, `fetchRemoteProjects`, and `syncProjectsFromRemote`.

### Desktop Service

Both service scripts should support the same API shape:

- `GET /api/health`
- Existing `GET /api/projects/index`
- Existing `GET /api/projects`
- Existing `GET /api/projects/<id>`
- Existing `POST /api/projects`
- Existing `POST /api/projects/<id>`

The service remains file-backed. It should not be responsible for UI conflict choices, but it should preserve payloads and history when merging incoming projects.

## Error Handling

- If history creation fails in the browser, the current save still proceeds and shows the normal save message. History is a safety feature, not a blocker.
- If `/api/health` fails, manual sync keeps the existing fallback message.
- If a conflict duplicate cannot be saved remotely, it remains in current-device storage and the user sees the existing local-save fallback.
- If project history makes the local storage write too large, the existing memory fallback remains active.

## Testing

Add or extend tests in `web/test.html` for:

- Project normalization keeps `history`.
- Saving a changed project adds the previous payload to history.
- Saving an unchanged project does not add duplicate history.
- Merging conflicting local and remote projects keeps both by creating a conflict copy.
- Summary-only remote projects do not erase existing payload or history.
- Health response parsing produces a useful status.

Service checks:

- Python compile both service scripts.
- `GET /api/health` returns JSON with expected fields.
- Existing project index and single-project endpoints still work.

Browser regression:

- `web/test.html` must pass from repo source.
- Desktop app resources must be synced.
- `http://127.0.0.1:8766/test.html` must pass after service restart.

## Rollout

1. Implement and test in the repository.
2. Copy changed frontend and service files into `Q像素.app/Contents/Resources`.
3. Restart only the QPixel local service on port `8766`.
4. Verify `/api/health`, `/api/projects/index`, and `/api/projects/<id>`.
5. Commit and push to `Qiqy17/q-pixel`.

## Open Follow-Up

A later pass can add a polished history drawer with side-by-side preview, manual conflict choice, and one-click restore from server backup files. This first pass prioritizes automatic protection and clearer status without large UI churn.
