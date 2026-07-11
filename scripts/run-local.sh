#!/usr/bin/env bash
# Start Mission Control UI + Agent OS kernel (two repos)
set -euo pipefail

KERNEL_DIR="${KERNEL_DIR:-$HOME/git/AESP-Reference-Implementation}"
UI_DIR="${UI_DIR:-$HOME/git/hermes-mission-control-ui}"
KERNEL_PORT="${KERNEL_PORT:-8080}"
UI_PORT="${UI_PORT:-5173}"
USE_MOCKS="${USE_MOCKS:-0}"

echo "Kernel: $KERNEL_DIR  →  :$KERNEL_PORT"
echo "UI:     $UI_DIR      →  :$UI_PORT  (mocks=$USE_MOCKS)"
echo ""

if ! curl -sf "http://127.0.0.1:$KERNEL_PORT/api/v1/health" >/dev/null 2>&1; then
  (
    cd "$KERNEL_DIR"
    [ -x bin/aespd ] || go build -o bin/aespd ./cmd/aespd
    AESP_WORKSPACE="$KERNEL_DIR/.aesp-workspace" ./bin/aespd serve ":$KERNEL_PORT"
  ) &
  echo "Started aespd (background)"
  sleep 1
else
  echo "Kernel already up on :$KERNEL_PORT"
fi

cd "$UI_DIR"
[ -d node_modules ] || npm install
echo ""
echo "Open in browser:"
echo "  http://127.0.0.1:$UI_PORT"
echo "  http://localhost:$UI_PORT"
echo "Stop with Ctrl+C"
echo ""
VITE_USE_MOCKS="$USE_MOCKS" npm run dev -- --host 127.0.0.1 --port "$UI_PORT"
