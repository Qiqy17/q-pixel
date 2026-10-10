#!/usr/bin/env bash
set -euo pipefail

TASK_REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TASK_QA_NODE="${QPIXEL_QA_NODE:-node}"
TASK_REPORT_DIR="${1:-$TASK_REPO_DIR/docs/qa/2026-10-10-stability}"
cd "$TASK_REPO_DIR"

"$TASK_QA_NODE" -e 'if(Number(process.versions.node.split(".")[0])<20)throw Error("Browser QA requires Node 20+. Set QPIXEL_QA_NODE to the bundled Node runtime.")'
NODE_PATH="${QPIXEL_QA_NODE_MODULES:-${NODE_PATH:-}}" "$TASK_QA_NODE" -e 'require("playwright")'
npm test
npm run build
git diff --check
python3 tests/native-lifecycle.py "$TASK_REPORT_DIR"
NODE_PATH="${QPIXEL_QA_NODE_MODULES:-${NODE_PATH:-}}" "$TASK_QA_NODE" tests/stability-browser.cjs "$TASK_REPORT_DIR"
printf 'Stability QA passed. Reports: %s\n' "$TASK_REPORT_DIR"
