# 智能板取消与离线保存回归

日期：2026-10-02（北京时间）。沿用已批准的智能板试点与离线项目方案；Tailscale 跨网络接入已按用户要求待定。

## 问题及修复

- 修复前的自动化复现：32格PNG异步生成期间点击取消，完成后仍发出原生`send`请求（记录为connect → cancel → send），等待设备应答。52格使用同一路径。
- 发送事务增加取消标记：生成中取消或收到断连事件后禁止提交；取消后的迟到完成回执不能提示成功；结束后不接收迟到进度覆盖状态。
- 原生桥接同步抛错时立即清除待处理任务和超时定时器。
- 不修改原图、库存、色号、离线同步规则。缓存版本更新为60。

## 验证

- `node tests/smart-board-ui.test.js`：32/52格生成中取消、生成中断连、迟到完成及进度、重试、桥接抛错通过。测试使用受控DOM和原生桥接，不能当作硬件验收。
- 实际Chromium隔离会话`qpixel-cancel60`，独立地址`127.0.0.1:8885`：真实DOM控件和canvas PNG，受控延迟与模拟原生桥接，9项检查通过；脚本见`browser-check.js`。没有访问用户原有页面或作品。
- 同一隔离浏览器执行`tests/offline-projects.browser.js`，真实IndexedDB的14项检查通过，包括失败回滚、双页面冲突副本、旧回执不清除新修改、127条记录和草稿清理。
- `npm test`：23个JS测试文件、5个Python用例通过；`npm run build`和`git diff --check`通过。

## 交付边界

- 已安装`/Users/mac/Desktop/Q像素.app`，版本2.0.0 / build60；源码提交`1e36fcf102ce1e7a44d53bb6bea4a6bdf662aa57`。构建时间UTC 2026-10-01T17:19:50Z，即北京时间2026-10-02 01:19:50。
- 安装前未发现桌面QPixel运行进程；旧包已备份至`/Users/mac/Documents/Q像素/app-backups/Q像素-20261002-011957.app`。
- 安装前及安装后`verify_release.sh`均通过（资源、签名和Swift协议测试）。源码与安装包的smart-board-ui.js SHA256相同：`ac4e15ad1d4d2d705df24e5a95cac4330f2bf9be3605e0b371cae5b1c7087fa9`。
- 01:20电脑服务`/api/health`返回ok=true、projectsOk=true、settingsOk=true。

未公开发布；真实智能板、真实iPad以及原生App界面操作尚未验收。
