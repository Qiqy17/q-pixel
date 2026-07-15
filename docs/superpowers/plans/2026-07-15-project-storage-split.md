# Q像素项目存储拆分实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将项目存储从单个大 JSON 扩展为项目索引与独立项目文件，同时兼容已有数据和旧客户端。

**Architecture:** 服务端继续保留 `/api/projects` 作为兼容接口，新增 `/api/projects/index` 返回轻量索引、`/api/projects/<id>` 读写独立项目文件；首次访问时从旧 JSON 懒迁移，不删除旧文件。客户端首页只读取索引，打开项目时按 ID 拉取 payload，保存时只写当前项目。

**Tech Stack:** Python `http.server`、JSON 文件、原生 JavaScript、现有 Q像素同步服务。

---

### Task 1: 增加独立项目文件存储服务

**Files:**
- Modify: `scripts/qpixel_sync_server.py`
- Modify: `scripts/qpixel_ipad_https_server.py`

- [x] 新增 `PROJECTS_DIR = DATA_DIR / "projects"`，读取独立文件并在目录为空时从旧项目 JSON 拆分。
- [x] 让索引接口只返回不含 payload 的摘要，单项目接口优先读取独立文件。
- [x] 单项目保存写入 `projects/<id>.json`，保留原子替换、备份和写入锁。
- [x] 保留旧 `/api/projects`，用于旧版本客户端和迁移兜底。
- [x] 更新健康检查，增加独立项目目录数量和总大小。

### Task 2: 客户端优先使用索引和单项目接口

**Files:**
- Modify: `web/app.js`

- [x] 首页同步只保存轻量索引，避免把所有 payload 写入 localStorage。
- [x] 打开没有 payload 的项目时调用单项目接口并缓存结果。
- [x] 当前项目保存优先调用单项目保存接口，失败时保留本机缓存和旧批量接口兜底。
- [x] 保持当前冲突副本、离线保存和旧服务兼容行为。

### Task 3: 迁移与回归验证

**Files:**
- Modify: `docs/OPENAI_SETUP.md` or add storage note if needed
- Test: `web/test.html`

- [x] 用现有 40 个项目执行一次只读迁移检查，确认项目数量、标题、尺寸和 payload 数量一致。
- [x] 验证首页、打开项目、保存项目、设置同步、离线缓存和旧 `/api/projects` 接口。
- [x] 验证桌面端与 iPad 服务使用相同数据目录时结果一致。
- [x] 同步桌面资源，运行 Python 编译检查、Node 语法检查、浏览器检查和自动化测试。
- [ ] 提交并推送，记录迁移结果。
