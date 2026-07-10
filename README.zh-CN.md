# Q像素

Q像素是一个本地运行的像素画和拼豆图纸编辑器，包含网页端、macOS 桌面壳、本地同步服务、图片像素校准、色号优化和回归测试页面。

## 当前版本功能

- 电脑端 Q像素应用、电脑网页和平板网页通过本机 `/api/projects` 服务共享同一套作品数据。
- macOS 桌面应用支持原生保存 PNG 和 `.qpx` 设计文件。
- 增加色号优化功能，可将整幅图控制在指定色号数量内，例如小于或等于 20 色，并尽量保留深色线条和主体区域。
- 所有图片导入时都可选择“像素校准后导入”或“直接导入”。
- 像素校准支持调整网格位置、网格列数和单元格大小。
- 像素画导入会优先使用单元格中心主色，并自动清理白底杂色、孤立杂点和边缘抗锯齿色，减少不必要的相近色号。
- 更新离线缓存版本，让平板网页和电脑网页更容易保持同一版本。

## 为什么像素画导入后会出现很多杂色

很多像素风图片看起来颜色很干净，但文件里通常仍然包含这些细节：

- 边缘抗锯齿：黑线边上会有灰色、浅灰、半透明过渡色。
- 图片压缩或缩放：原本同一种粉色、黄色、白色会变成很多非常接近的 RGB 值。
- 网格没有完全对齐：一个格子采样到两种颜色的交界时，平均色会落到第三个色号。
- 白色背景不完全纯白：背景阴影、压缩噪点会被识别成不同白色或浅灰色号。

新版导入流程针对像素画做了优化：

- 采样时更重视单元格中心区域，减少边缘过渡色影响。
- 用局部主色替代简单平均色，避免把两种颜色平均成一个杂色。
- 自动识别边框背景色，将接近背景的浅色噪点合并回背景。
- 对孤立色块和极小用量杂色做邻域清理，同时尽量保留深色线条。

## 目录说明

- `web/`：网页应用源码，包括 HTML、CSS、JavaScript、离线缓存、安装清单和测试页。
- `macos/QPixel.swift`：macOS 桌面应用的 AppKit/WebKit 外壳源码。
- `scripts/`：本地 HTTP 同步服务、iPad 访问服务和部署脚本。
- `assets/`：应用图标和测试图片资源。

## 本地运行

在项目根目录运行：

```sh
python3 -m http.server 8766 --directory web
```

然后打开：

```text
http://127.0.0.1:8766/index.html
```

## 平板/多端同步

用于平板访问和多端同步的服务脚本是：

```text
scripts/qpixel_ipad_https_server.py
```

共享作品文件默认保存到：

```text
~/Documents/Q像素/qpixel-projects.json
```

同步逻辑会按作品的 `updatedAt`、`savedAt`、`createdAt` 判断新旧，避免电脑应用、电脑网页和平板网页互相覆盖旧版本。

## 编译 macOS 桌面壳

```sh
swiftc macos/QPixel.swift -o QPixel -framework AppKit -framework WebKit
```

编译出的 `QPixel` 可执行文件放入：

```text
Q像素.app/Contents/MacOS/QPixel
```

## 测试

基础检查：

```sh
node --check web/app.js
python3 -m py_compile scripts/qpixel_ipad_https_server.py scripts/qpixel_sync_server.py
swiftc macos/QPixel.swift -o /tmp/QPixel-test-build -framework AppKit -framework WebKit
```

浏览器回归测试页面：

```text
web/test.html
```

## 发布到 GitHub

先登录 GitHub CLI：

```sh
gh auth login --hostname github.com --git-protocol https --web
```

然后在项目根目录执行：

```sh
./scripts/deploy_github.sh
```

默认发布到：

```text
https://github.com/Qiqy17/q-pixel
```
