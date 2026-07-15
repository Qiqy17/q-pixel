# Q像素 AI 生图配置

Q像素的“AI灵感”使用 OpenAI GPT Image 2。API key 只由本机 Python 服务读取，网页、桌面资源和 GitHub 仓库都不应保存真实 key。

## 推荐配置：保存到 macOS 钥匙串

双击运行：

```text
/Users/mac/GitHub/q-pixel/scripts/配置OpenAI密钥.command
```

输入一次 OpenAI API Key 后，Q像素本机服务会从 macOS 钥匙串读取，不需要每次重新设置环境变量。桌面包中也同步提供了同名配置脚本。

## macOS 临时配置

在启动 Q像素服务的同一个终端执行：

```zsh
export OPENAI_API_KEY="你的 OpenAI API key"
python3 /Users/mac/GitHub/q-pixel/scripts/qpixel_sync_server.py
```

桌面/iPad 服务：

```zsh
export OPENAI_API_KEY="你的 OpenAI API key"
/Users/mac/Desktop/Q像素.app/Contents/Resources/run_ipad_server.sh
```

也可以设置可选参数：

```zsh
export OPENAI_IMAGE_QUALITY="medium"  # low 更快更省，high 更精细
export OPENAI_IMAGE_MODEL="gpt-image-2"
```

## 使用方式

打开 Q像素的“AI灵感”，填写主题、网格宽高和最多色号，点击“开始生成”。生成图片会自动进入 Q像素的导入流程，默认开启原图对比层，之后仍可使用像素校准、三种导入模式、还原优化和色号锁定。

如果没有配置 key，界面会显示“未配置 OpenAI API Key”；如果遇到组织验证、额度或网络错误，请先查看 OpenAI 控制台状态。

## 安全要求

- 不要把 key 写入 `web/app.js`、桌面 `Contents/Resources`、`.env` 提交文件或 GitHub。
- 不要在浏览器 Network 面板或日志中打印 Authorization header。
- 建议为此功能使用单独的、可轮换的 API key，并设置账户预算和使用提醒。
