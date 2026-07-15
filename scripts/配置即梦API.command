#!/bin/zsh
set -euo pipefail
echo "Q像素 即梦 AI（火山引擎）API 配置"
echo "请输入火山引擎 Access Key ID 和 Secret Access Key。"
read -r "ACCESS_KEY?Access Key ID: "
read -r -s "SECRET_KEY?Secret Access Key（输入时不会显示）："
echo
if [[ -z "$ACCESS_KEY" || -z "$SECRET_KEY" ]]; then
  echo "凭证不完整，配置取消。"
  exit 1
fi
/usr/bin/security add-generic-password -a "$USER" -s "qpixel-volcengine-access-key" -w "$ACCESS_KEY" -U >/dev/null
/usr/bin/security add-generic-password -a "$USER" -s "qpixel-volcengine-secret-key" -w "$SECRET_KEY" -U >/dev/null
unset ACCESS_KEY SECRET_KEY
echo "配置完成。请重新启动 Q像素服务。"
read -k 1 "?按任意键退出..."
