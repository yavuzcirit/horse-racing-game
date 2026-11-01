#!/usr/bin/env sh
set -eu

PLAYWRIGHT_VERSION=$(npx --no-install playwright --version | awk '{ print $2 }')
IMAGE="mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble"

docker run --rm --ipc=host \
  -v "$(pwd)":/work \
  -v /work/node_modules \
  -w /work \
  -e CI=1 \
  "$IMAGE" \
  /bin/bash -c "npm ci --ignore-scripts --no-audit --no-fund && npx playwright test --project=visual-desktop --project=visual-mobile $*"
