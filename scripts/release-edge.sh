#!/bin/bash

# Restore all git changes
git restore -s@ -SW  -- packages examples

# Bump versions to edge
yarn jiti ./scripts/bump-edge

# Update yarn workspace
yarn

# Build packages
# yarn build

# Release packages
npm whoami
for p in packages/* ; do
  pushd $p
  echo "Publishing $p"
  npm publish --dry-run
  popd
done

# Restore git
# git restore -s@ -SW  -- packages examples
