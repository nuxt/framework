#!/bin/bash

set -e

# Restore all git changes
git restore -s@ -SW  -- packages examples

# Bump versions
yarn lerna version --preid rc --no-changelog --no-push -m "chore: release rc"

# Release packages
for PKG in packages/* ; do
  pushd $PKG
  TAG="latest"
  if [ "$PKG" == "packages/nuxt" ]; then
    TAG="rc"
  fi
  echo "⚡ Publishing $PKG with tag $TAG"
  echo yarn npm publish --tag $TAG --access public --tolerate-republish
  popd > /dev/null
done
