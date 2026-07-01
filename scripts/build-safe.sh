#!/bin/sh
set -e

echo "== CLEAN BUILD START =="

rm -rf .next node_modules/.cache build-error.log

export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--max-old-space-size=768"

pnpm build 2>&1 | tee build-error.log

echo "== CLEAN BUILD DONE =="
