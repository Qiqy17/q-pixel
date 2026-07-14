# Q像素导入还原与编辑安全优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 一次完成导入摘要、多档非破坏式还原、未保存保护和编辑页移动端验收。

**Architecture:** 复用当前导入模式、校准、撤销和项目保存机制，只在前端增加摘要状态、安全拦截和三档还原策略。项目数据格式不变，未保存状态由运行时状态维护，保存和同步仍走既有接口。

**Tech Stack:** 原生 HTML/CSS/JavaScript、Canvas、localStorage、现有 Python 同步服务、Playwright。

---

### Task 1: 导入摘要状态与界面

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html:1051-1076, 430-476`
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js:275-290, 2240-2265, 3070-3095`
- Modify: `/Users/mac/GitHub/q-pixel/web/styles.css`

- [ ] **Step 1: Add summary markup and runtime fields**

增加 `importSummary` 容器和状态字段，展示模式、尺寸、色号数、校准与对比状态。

- [ ] **Step 2: Implement `renderImportSummary`**

从当前 pattern 和导入状态生成安全文本，直接导入、校准导入、重新生成后都刷新摘要。

- [ ] **Step 3: Verify import summary behavior**

在浏览器测试中调用现有测试入口生成图纸，断言摘要包含模式、尺寸和色号数。

### Task 2: 三档非破坏式还原

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html:463-476`
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js:4520-4720, 11955-12010`
- Modify: `/Users/mac/GitHub/q-pixel/web/styles.css`
- Modify: `/Users/mac/GitHub/q-pixel/web/test.html`

- [ ] **Step 1: Replace single action with three buttons**

增加 `restoreLightButton`、`restoreBalancedButton`、`restoreDetailButton`，保留现有恢复撤销历史。

- [ ] **Step 2: Implement mode-specific restoration**

新增 `restorePixelArtDetails(mode = "balanced")` 的模式参数：轻度只移除低置信孤立色，均衡执行轮廓连通和小区域修复，强细节降低合并阈值并保留锁定高光/轮廓色；每次处理前调用现有 `pushHistory`。

- [ ] **Step 3: Add repeat guard and result message**

使用现有 restoration fingerprint 加入模式，重复处理同一模式时直接提示无需重复处理，并显示处理前后色号数。

- [ ] **Step 4: Add pure regression checks**

为三档模式暴露测试入口，断言三档都返回合法 pattern、锁定色未被删除、重复 fingerprint 被拦截。

### Task 3: 未保存状态保护

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/app.js:275-290, 10048-10075, 10240-10520, 10780-10810`
- Modify: `/Users/mac/GitHub/q-pixel/web/index.html:100-115`
- Modify: `/Users/mac/GitHub/q-pixel/web/styles.css`
- Modify: `/Users/mac/GitHub/q-pixel/web/test.html`

- [ ] **Step 1: Add runtime dirty-state helpers**

增加 `state.hasUnsavedChanges`、`markUnsavedChanges`、`markSaved`、`confirmLeaveWithUnsavedChanges`，保存成功前保持脏状态，保存失败不清除。

- [ ] **Step 2: Mark editing mutations**

在绘制、导入、还原、色号优化、恢复历史和新建画布等成功改变图纸的路径调用 `markUnsavedChanges`；项目打开和保存成功调用 `markSaved`。

- [ ] **Step 3: Guard navigation**

返回首页、打开其他项目、打开历史预览和切换文件时使用统一确认弹窗，取消则保持当前页面和内容。

- [ ] **Step 4: Add lightweight visual status**

保存按钮旁显示“未保存”或“已保存”，不改变现有操作按钮布局。

- [ ] **Step 5: Test dirty-state transitions**

覆盖修改后 dirty、保存后 clean、取消离开仍 dirty、保存失败仍 dirty 四种状态。

### Task 4: 响应式和集成验收

**Files:**
- Modify: `/Users/mac/GitHub/q-pixel/web/styles.css`

- [ ] **Step 1: Check editor view at three widths**

用 Playwright 检查 390px、768px、1440px 的 `scrollWidth === clientWidth`，并确认新增按钮可见。

- [ ] **Step 2: Run repository and desktop tests**

在 `http://127.0.0.1:8777/test.html` 与 `http://127.0.0.1:8766/test.html` 均要求 `PASS`。

- [ ] **Step 3: Sync desktop resources and push**

同步 `index.html`、`styles.css`、`app.js`、`test.html` 到桌面应用资源目录，运行 `git diff --check`，提交并推送 `main`。
