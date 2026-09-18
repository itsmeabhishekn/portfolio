#!/usr/bin/env bash
# Run the portfolio and Squat together so http://localhost:3000/squat/ works.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

npm run squat:dev &
squat_pid=$!

cleanup() {
  kill "$squat_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

npx next dev
