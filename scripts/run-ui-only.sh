#!/usr/bin/env bash
# UI only — no kernel required (MSW mocks)
set -euo pipefail
cd "$(dirname "$0")/.."
[ -d node_modules ] || npm install
echo "Open: http://127.0.0.1:5173  (mock Host Interface)"
VITE_USE_MOCKS=1 npm run dev -- --host 127.0.0.1 --port 5173
