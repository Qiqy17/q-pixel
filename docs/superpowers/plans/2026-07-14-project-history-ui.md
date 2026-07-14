# Q像素项目历史版本界面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为现有项目历史快照增加查看、预览打开和恢复当前版本的完整界面，并同步到桌面版。

**Architecture:** 复用 `project.history` 内的快照，不增加 API。前端在项目操作弹窗打开历史列表，预览使用独立的无项目 ID载入，恢复通过统一的项目历史包装函数把当前内容留档后写回原项目，再复用现有保存和同步流程。

**Tech Stack:** 原生 HTML/CSS/JavaScript、localStorage、现有 Python 同步服务、Playwright 浏览器测试。

---

### Task 1: 增加历史版本界面结构

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html:1115-1131`
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js:533-536`

- [ ] **Step 1: Add the history button and modal markup**

在设计文件操作卡片中加入 `projectActionHistoryButton`。在其后增加 `projectHistoryModal`，包含关闭按钮、项目标题、说明和动态列表容器 `projectHistoryList`。

- [ ] **Step 2: Register all new IDs**

把历史按钮、弹窗、关闭按钮、标题和列表加入 `els` 的 ID 列表，确保在桌面资源版缺少旧缓存时不会发生未定义访问。

- [ ] **Step 3: Run duplicate-ID check**

运行：`node -e 'const fs=require("fs"); const s=fs.readFileSync("web/index.html","utf8"); const ids=[...s.matchAll(/id="([^"]+)"/g)].map(m=>m[1]); const d=ids.filter((id,i)=>ids.indexOf(id)!==i); if(d.length) process.exit(1); console.log("duplicate ids: none")'`

预期：输出 `duplicate ids: none`。

### Task 2: 实现历史预览与恢复逻辑

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js:275-289, 9681-9723, 10211-10225, 10765-10772, 11965-11980`

- [ ] **Step 1: Add focused restore helper**

新增 `restoreProjectHistoryVersion(project, versionId, now)`：查找目标快照，复制目标正文，保留原项目 ID、标题、创建时间，更新保存时间，并调用 `withProjectHistory` 将恢复前正文放入历史；找不到目标时返回 `null`。

- [ ] **Step 2: Render history rows**

新增 `renderProjectHistoryList(project)`，空列表显示“暂无历史版本”；每条快照使用文本节点填充标题、保存时间、尺寸，并绑定预览和恢复按钮。

- [ ] **Step 3: Add modal lifecycle and preview behavior**

新增 `openProjectHistoryModal`、`closeProjectHistoryModal`、`previewProjectHistoryVersion`、`restoreProjectHistoryVersionFromUi`。预览载入深拷贝后的 payload，清空项目 ID并将标题改为“原标题 历史预览”；恢复走本地项目缓存、现有远端保存函数和列表刷新。

- [ ] **Step 4: Connect events and disable empty entry**

在 `openProjectActionModal` 中根据历史数量更新按钮 disabled 状态；为入口、关闭按钮和遮罩绑定事件。

- [ ] **Step 5: Expose pure helper for tests**

将恢复构造函数以 `restoreProjectHistoryVersionForTest` 暴露给 `web/test.html`，不暴露 UI 异步函数。

### Task 3: 优化历史弹窗样式

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/styles.css:2805-3002`

- [ ] **Step 1: Add compact history layout styles**

为历史卡片设置 `width: min(700px, 100%)`、`max-height` 和 `overflow: auto`；历史行使用网格布局，操作按钮在窄屏自动换行。

- [ ] **Step 2: Add empty, metadata, and warning states**

提供历史时间、尺寸、当前版本标识和恢复按钮的轻量视觉层级，不新增复杂装饰。

- [ ] **Step 3: Check responsive overflow**

在 390px 和 1440px 视口检查历史弹窗不横向溢出，按钮可点击。

### Task 4: Add regression tests

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/test.html:558-600`

- [ ] **Step 1: Test restore data semantics**

构造含当前正文和历史快照的项目，调用测试 helper，断言恢复后 ID保持不变、目标正文成为当前正文、恢复前正文新增到历史首项。

- [ ] **Step 2: Test missing version guard**

调用不存在的版本 ID，断言返回 `null`。

- [ ] **Step 3: Run browser test**

启动 `python3 -m http.server 8777 --directory /Users/mac/GitHub/q-pixel/web`，打开 `http://127.0.0.1:8777/test.html`，预期页面结果为 `PASS`。

### Task 5: Sync desktop app and deliver

**Files:**
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/index.html`
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/styles.css`
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/app.js`
- Modify: `/Users/mac/Desktop/Q像素.app/Contents/Resources/test.html`

- [ ] **Step 1: Copy validated frontend files to desktop resources**

同步四个前端文件，保留服务脚本和用户数据不变。

- [ ] **Step 2: Run desktop browser verification**

在 `http://127.0.0.1:8766/test.html` 运行同一测试并确认页面为 `PASS`。

- [ ] **Step 3: Commit and push**

运行 `git diff --check`，提交 `feat: add project history restore UI`，然后推送到 `origin/main`。
