#!/bin/zsh
set -e

cd "$(dirname "$0")"

IP="$(/usr/sbin/ipconfig getifaddr en0 || true)"
if [[ -z "$IP" ]]; then
  IP="$(/usr/sbin/ipconfig getifaddr en1 || true)"
fi
if [[ -z "$IP" ]]; then
  echo "没有找到当前 Wi-Fi 地址，请先连接 Wi-Fi。"
  exit 1
fi

export QPIXEL_IP="$IP"
PYTHON_BIN="$(command -v python3)"
exec "$PYTHON_BIN" -B qpixel_ipad_https_server.py --cert-host "$IP" --port 8766
