#!/bin/zsh
set -e

APP_DIR="$HOME/Desktop/Q像素.app/Contents/Resources"
if [[ ! -f "$APP_DIR/run_ipad_server.sh" ]]; then
  echo "没有找到已安装的 Q像素 App。"
else
  /bin/zsh "$APP_DIR/run_ipad_server.sh"
fi
echo
read -k 1 "?按任意键退出..."
