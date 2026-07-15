#!/bin/zsh
set -euo pipefail

SERVICE="qpixel-openai-api-key"
echo "Q像素 OpenAI API Key 配置"
echo "密钥只会保存到本机 macOS 钥匙串，不会写入网页或 GitHub。"
echo
read -r -s "KEY?请输入 OpenAI API Key（输入时不会显示）："
echo
if [[ -z "$KEY" ]]; then
  echo "未输入密钥，配置取消。"
  exit 1
fi

/usr/bin/security add-generic-password -a "$USER" -s "$SERVICE" -w "$KEY" -U >/dev/null
unset KEY
echo "配置完成。请重新启动 Q像素服务后再点击 AI 生成。"
read -k 1 "?按任意键退出..."
