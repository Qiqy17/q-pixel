#!/bin/zsh
set -e
cd "$(dirname "$0")"
IP="$(ipconfig getifaddr en0 || true)"
if [[ -z "$IP" ]]; then
  IP="$(ipconfig getifaddr en1 || true)"
fi
if [[ -z "$IP" ]]; then
  echo "没有找到当前 Wi-Fi 地址，请先连接 Wi-Fi。"
  read -k 1 "?按任意键退出..."
  exit 1
fi
export QPIXEL_IP="$IP"
echo "Q像素 iPad 离线安装地址："
echo "https://$IP:8766/index.html"
echo
echo "第一次使用需要在 iPad 上信任证书："
echo "$HOME/Documents/Q像素/ipad-cert/qpixel-ipad.crt"
echo
/usr/bin/python3 qpixel_ipad_https_server.py --cert-host "$IP" --port 8766
