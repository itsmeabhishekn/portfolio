#!/usr/bin/env bash
# S3 REST origins return AccessDenied for missing keys. Copy the SPA shell so
# /squat/login/ and the other client routes exist as real objects.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INDEX="$ROOT/out/squat/index.html"

if [[ ! -f "$INDEX" ]]; then
  echo "Missing $INDEX — run squat:build first." >&2
  exit 1
fi

for route in login dashboard programs exercises progress history profile; do
  mkdir -p "$ROOT/out/squat/${route}"
  cp "$INDEX" "$ROOT/out/squat/${route}/index.html"
done
