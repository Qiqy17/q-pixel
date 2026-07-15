#!/bin/zsh
set -euo pipefail

SERVICE="qpixel-hf-token"
echo "Q像素 Hugging Face Token 配置"
echo "Token 只会保存到本机 macOS 钥匙串，不会写入网页或 GitHub。"
echo
read -r -s "TOKEN?请输入 Hugging Face Token（输入时不会显示）："
echo
if [[ -z "$TOKEN" ]]; then
  echo "未输入 Token，配置取消。"
  exit 1
fi

/usr/bin/security add-generic-password -a "$USER" -s "$SERVICE" -w "$TOKEN" -U >/dev/null
unset TOKEN
echo "配置完成。请重新启动 Q像素服务后再点击 AI 生成。"
read -k 1 "?按任意键退出..."
