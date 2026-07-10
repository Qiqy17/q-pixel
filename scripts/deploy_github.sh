#!/usr/bin/env bash
set -euo pipefail

REPO_OWNER="${REPO_OWNER:-Qiqy17}"
REPO_NAME="${REPO_NAME:-q-pixel}"
REPO_VISIBILITY="${REPO_VISIBILITY:-public}"

if ! command -v gh >/dev/null 2>&1; then
  if [ -x "$HOME/.local/bin/gh" ]; then
    export PATH="$HOME/.local/bin:$PATH"
  else
    echo "GitHub CLI not found. Install gh first." >&2
    exit 1
  fi
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not logged in. Run: gh auth login --hostname github.com --git-protocol https --web" >&2
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Run this script from inside the q-pixel git repository." >&2
  exit 1
fi

if ! gh repo view "$REPO_OWNER/$REPO_NAME" >/dev/null 2>&1; then
  gh repo create "$REPO_OWNER/$REPO_NAME" \
    "--$REPO_VISIBILITY" \
    --description "Q Pixel editor source release"
fi

git remote remove origin >/dev/null 2>&1 || true
git remote add origin "https://github.com/$REPO_OWNER/$REPO_NAME.git"
git push -u origin main

echo "Published: https://github.com/$REPO_OWNER/$REPO_NAME"
