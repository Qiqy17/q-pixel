# 智能板第一阶段验收记录

日期：2026-10-01（北京时间）。实现提交：`ea36a7dd7e32dfac3decb134d7314c36c4956e00`。

## 已完成

| 范围 | 证据与结果 |
| --- | --- |
| 数据变换 | `node tests/smart-board.test.js`通过：非方形旋转、先镜像后旋转、边缘补空格、色号与数量守恒、H1与null区分、未知色号报错、输入不变、非法尺寸和过多分板拒绝 |
| 公开协议 | 同一测试通过官方社区公开向量、CRC32标准向量、104板8帧RGB数据及默认预览动作；未默认为设备存图 |
| 原生逻辑 | `swiftc macos/SmartBoardProtocol.swift tests/smart-board-native.test.swift -o /tmp/qpixel-smart-board-native-test`及执行通过：CRC、帧头、长度、尺寸、存图拒绝、早到/重复/最终应答、应答与GATT写入的顺序竞争 |
| 实际浏览器导出 | 独立agent-browser会话、静态测试服务127.0.0.1:8878；创建48×48画布并实际画1颗E11，通过界面下载ZIP，再用Python zipfile和Pillow重新打开验证 |
| 导出内容 | 52×52 PNG、一颗非空像素、空格透明、416×416放大图、CSV BOM、完整manifest文件表；32×32旋转/镜像四板仍合计1颗E11；校验各PNG尺寸和ZIP CRC |
| 离线 | 开启浏览器offline模式后实际下载成功；另在缓存就绪后离线刷新、恢复测试草稿、打开导出并下载成功。这证明测试浏览器的缓存及导出流程，不代表真实iPad已验收或完整项目离线保存已实现 |
| 取消 | 500×500合成测试图、104分块25板；生成第一板后取消，未调用ZIP封装且源图不变 |
| 界面 | Chromium 768×1024模拟视口无横向溢出；浏览器不展示Mac蓝牙操作；智能板区域位于导出侧栏顶部、可独立滚动 |
| 桥接模拟 | 模拟扫描/连接104板：52设置阻止发送；H7单色发送采用白光且源色板不变；8帧发送取消后按钮恢复。只验证JavaScript桥接流程，不代表CoreBluetooth或实机连接通过 |
| 回归 | `npm test`：21个JS测试文件、5个Python测试通过；`npm run build`、JS语法检查、Swift类型检查、`git diff --check`通过 |

实际导出文件名称、设置和SHA256见[export-evidence.json](export-evidence.json)。该记录来自隔离测试会话，不涉及用户项目。

## 候选包

- 路径：`/Users/mac/GitHub/q-pixel/dist/Q像素-smart-board-build56.app`
- 版本：2.0.0，build 56；构建时间UTC `2026-10-01T10:11:41Z`，北京时间18:11:41。
- `release-info.json`记录上述实现提交；构建时源码工作区干净。
- 可执行文件SHA256：`e023df72479909f0220fa521182ae57a0bff875698a4ac4e6dc53d86b51372e3`。
- `bash scripts/verify_release.sh 'dist/Q像素-smart-board-build56.app'`通过资源一致性、manifest哈希、原生协议测试及签名校验。
- 本次生成候选包，未替换桌面安装版本，未对外发布。

## 待实机验收

尚未通过实际Mac App界面连接真实HPD板。设备GATT服务组合、通知格式、传输速度、固件差异、亮度及灯光位置需要实物验证。真实iPad触控、Safari下载与独立安装运行也未验收。不能据此称为四品牌已兼容。

单色引导白光便于看见黑色豆位置；整图RGB显示仍是色板参考值。完整平板离线项目保存、任意网络同步电脑、原生iPad蓝牙桥接不属于本次候选包交付范围。
