# Q像素导入优化向导实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有图片导入、像素校准、三种导入模式和色号优化基础上，增加四步导入优化向导，让用户可以预览、调整、撤销并确认最终图纸。

**Architecture:** 复用现有导入校准和色号优化算法，新增一个向导状态层管理临时结果，不直接改写正式图纸。向导确认后才调用现有图纸替换流程；取消、返回和重新开始都丢弃临时状态。桌面端和网页端共用 `web/index.html`、`web/app.js`、`web/styles.css`，并同步到桌面资源目录。

**Tech Stack:** 原生 JavaScript、Canvas、现有 Q像素状态管理、Python 本地同步服务、现有 `web/test.html` 和 agent-browser。

---

### Task 1: 建立向导状态和步骤容器

**Files:**
- Modify: `web/index.html`
- Modify: `web/styles.css`
- Modify: `web/app.js`
- Test: `web/test.html`

- [x] 在图片导入选择弹窗中增加 4 步导航：识别、精度、色号、确认。
- [x] 增加向导状态对象，包含临时图纸、校准参数、导入模式、锁定色快照和当前步骤。
- [x] 增加进入下一步、返回上一步、取消向导和重新开始函数。
- [x] 保证现有“直接导入”和图层导入仍可用，旧项目打开不受影响。
- [x] 添加测试：打开向导后默认在第 1 步，取消后正式图纸、原图和校准参数不变化。

### Task 2: 实现第 1 步图片识别和导入模式预览

**Files:**
- Modify: `web/index.html`
- Modify: `web/styles.css`
- Modify: `web/app.js`
- Test: `web/test.html`

- [x] 复用 `estimatePixelArtGrid`、`makeDefaultCalibration` 和 `applyImportModeToPattern` 生成初步结果。
- [x] 显示原图和初步图纸的左右对比预览。
- [x] 将高保真、均衡、易制作三个按钮改为向导内的单选预设，并实时刷新右侧结果。
- [x] 保留原图叠加预览开关。
- [x] 增加“直接使用当前结果”和“进入精细调整”两个明确动作。
- [x] 添加测试：切换三个模式会更新临时预览，但不会修改正式 `state.beads.pattern`。

### Task 3: 实现第 2 步网格精度调整

**Files:**
- Modify: `web/index.html`
- Modify: `web/styles.css`
- Modify: `web/app.js`
- Test: `web/test.html`

- [x] 将现有校准控件接入向导临时校准对象，不再直接写入正式状态。
- [x] 支持列数、单元格大小、水平偏移、垂直偏移和画布宽高调整。
- [x] 调整后立即刷新局部 Canvas 预览。
- [x] 增加返回上一步和重新开始自动识别。
- [x] 在预览中支持查看原图与临时图纸，重点验证高光和轮廓。
- [x] 添加测试：校准完成后只进入临时色号步骤，确认前正式图纸不变。

### Task 4: 实现第 3 步色号保护与优化预览

**Files:**
- Modify: `web/index.html`
- Modify: `web/styles.css`
- Modify: `web/app.js`
- Test: `web/test.html`

- [x] 从当前临时图纸提取色号统计和颜色区域。
- [x] 增加保真优先、均衡、易制作三个导入策略，并支持单独进入色号优化。
- [x] 识别并默认锁定轮廓色、高光色和关键小区域颜色。
- [x] 将锁定色传入现有色号优化算法，禁止自动合并锁定色。
- [x] 显示优化前后色号数量和变化格数。
- [x] 支持保留当前颜色并可返回前面步骤。
- [x] 添加测试：优化后进入确认页，锁定色保护逻辑继续使用现有算法。

### Task 5: 实现第 4 步确认、版本保护和应用

**Files:**
- Modify: `web/index.html`
- Modify: `web/styles.css`
- Modify: `web/app.js`
- Test: `web/test.html`

- [x] 并排展示原图和最终图纸。
- [x] 显示色号数量、图纸尺寸和变化格数。
- [x] 点击“应用到当前图纸”时才替换 `state.beads.pattern`、图层和相关导入元数据。
- [x] 取消、返回首页、关闭弹窗时清理临时状态并恢复锁定色状态。
- [x] 添加测试：应用后正式图纸更新，确认前正式图纸保持原样。

### Task 6: 桌面端同步、回归和发布

**Files:**
- Modify: `web/app.js`
- Modify: `web/index.html`
- Modify: `web/styles.css`
- Modify: `scripts/qpixel_sync_server.py` only if import metadata needs persistence
- Sync: `/Users/mac/Desktop/Q像素.app/Contents/Resources/`
- Test: `web/test.html`

- [x] 运行 `node --check web/app.js`、Python 编译检查和 `git diff --check`。
- [x] 运行现有自动化测试和导入向导浏览器测试。
- [x] 使用 agent-browser 检查首页、导入向导、无控制台错误和无空白页面。
- [x] 用图片验证自动识别、色号优化、确认应用和像素校准路径。
- [x] 同步桌面端资源并验证桌面端与网页端结构一致。
- [ ] 提交、推送并记录测试结果。
