# Q像素 AI还原助手实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在导入优化向导中增加用户主动触发的 AI还原助手，提供主体提取、像素精度推荐和高置信度边缘修复，并支持预览、应用和放弃。

**Architecture:** AI助手作为导入向导的临时处理层，不直接修改正式图纸。处理流程先使用本地分析和图像算法生成基础结果，再根据当前 AI接口配置补充主体语义识别；外部接口失败时保留本地结果。处理结果以原图指纹、尺寸、模式和参数缓存，确认后才交给现有导入向导应用流程。

**Tech Stack:** 原生 JavaScript、Canvas、现有 Q像素像素采样/色号/锁定色算法、现有 Python AI接口服务、现有 agent-browser 回归测试。

---

### Task 1: 增加 AI还原助手入口和临时状态

**Files:**
- Modify: `web/index.html`
- Modify: `web/styles.css`
- Modify: `web/app.js`
- Test: `web/test.html`

- [ ] 在导入向导第 1 步增加“AI还原助手”按钮、处理状态和结果提示。
- [ ] 增加 `importAiAssist` 临时状态，包含 `running`、`stage`、`sourceFingerprint`、`resultImage`、`mask`、`recommendation`、`repairedPattern` 和 `error`。
- [ ] 增加开始、取消、应用、放弃和重试函数。
- [ ] 防止重复点击和并行处理。
- [ ] 添加测试：未点击按钮时不调用 AI，点击后出现处理中状态，取消后恢复原向导。

### Task 2: 实现本地主体提取和背景处理

**Files:**
- Modify: `web/app.js`
- Modify: `web/styles.css`
- Test: `web/test.html`

- [ ] 基于边缘连通性、背景颜色聚类和主体边界生成基础蒙版。
- [ ] 对背景接近主体或无法判断的图片返回低置信度，不自动删除主体区域。
- [ ] 生成去背景预览，不覆盖原始图片。
- [ ] 支持“只应用主体提取”和“保留原背景”。
- [ ] 添加普通照片、透明 PNG、像素画三种输入测试。

### Task 3: 实现像素精度推荐

**Files:**
- Modify: `web/app.js`
- Modify: `web/index.html`
- Test: `web/test.html`

- [ ] 计算规则网格置信度、轮廓转折密度、关键区域尺寸和主体占比。
- [ ] 复用 `estimatePixelArtGrid` 和 `makeDefaultCalibration` 输出推荐宽高、列数和单元格大小。
- [ ] 计算轮廓连续度、高光保留率和色号难度。
- [ ] 在 AI助手结果区显示推荐值和三项评分。
- [ ] 增加“应用推荐精度”和“继续手动校准”按钮。
- [ ] 添加测试：同一图片改变目标尺寸后推荐结果稳定，且不覆盖当前图纸。

### Task 4: 实现高置信度边缘修复

**Files:**
- Modify: `web/app.js`
- Modify: `web/index.html`
- Test: `web/test.html`

- [ ] 检测断裂轮廓、单格孤岛和轮廓附近异常颜色。
- [ ] 只对高置信度问题自动修复，低置信度问题只标记。
- [ ] 复用锁定色机制，保护轮廓、高光、眼睛和用户手动锁定颜色。
- [ ] 输出修复前后图纸和变化格数。
- [ ] 支持只应用边缘修复和放弃修复。
- [ ] 添加测试：高光和轮廓锁定后不被修复算法替换。

### Task 5: 接入可选 AI语义识别与回退

**Files:**
- Modify: `web/app.js`
- Modify: `scripts/qpixel_openai.py`
- Modify: `scripts/qpixel_sync_server.py`
- Modify: `scripts/qpixel_ipad_https_server.py`
- Modify: `docs/OPENAI_SETUP.md`

- [ ] 新增可选的图像分析请求，不配置 AI接口时跳过远程调用。
- [ ] 只请求主体区域、关键区域和语义标签，不让模型直接返回完整像素矩阵。
- [ ] 设置超时、错误提示和取消行为。
- [ ] AI失败时继续使用本地主体提取、精度推荐和边缘修复。
- [ ] 不在日志中记录原图内容或密钥。
- [ ] 添加成功、超时、未配置和接口错误测试。

### Task 6: 结果对比、缓存和应用

**Files:**
- Modify: `web/index.html`
- Modify: `web/styles.css`
- Modify: `web/app.js`
- Test: `web/test.html`

- [ ] 显示原图、AI处理图、当前图纸和修复后图纸。
- [ ] 显示变化格数、推荐精度、轮廓连续度、高光保留率和色号变化。
- [ ] 缓存键包含原图指纹、图纸尺寸、导入模式和 AI助手参数。
- [ ] 点击应用后再写入导入向导临时图纸。
- [ ] 放弃时清理缓存和临时状态，不改正式图纸。
- [ ] 添加完整流程测试。

### Task 7: 桌面同步、回归与发布

**Files:**
- Modify: `web/app.js`
- Modify: `web/index.html`
- Modify: `web/styles.css`
- Modify: `scripts/qpixel_openai.py`
- Modify: `scripts/qpixel_sync_server.py`
- Modify: `scripts/qpixel_ipad_https_server.py`
- Sync: `/Users/mac/Desktop/Q像素.app/Contents/Resources/`

- [ ] 运行 Node、Python 和 diff 检查。
- [ ] 用像素画、普通照片、透明 PNG 和含网格图片验证四类输入。
- [ ] 验证 AI未配置、网络失败、重复点击、取消和恢复流程。
- [ ] 使用 agent-browser 检查桌面宽屏、平板尺寸、无控制台错误和无横向溢出。
- [ ] 同步桌面端资源。
- [ ] 更新文档并提交、推送。

