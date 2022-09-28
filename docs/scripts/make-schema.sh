#!/bin/sh
set -e

cd ..
npx pnpm@7.12.0 install
npx pnpm@7.12.0 --filter @nuxt/schema prepack --stub
