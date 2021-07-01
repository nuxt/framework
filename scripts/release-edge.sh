#!/bin/bash

# Restore all git changes
git restore -s@ -SW  -- packages examples

# Bump versions to edge
yarn jiti ./scripts/bump-edge

# Update yarn workspace
yarn

# Build packages
# yarn build

# Update token
if [[ ! -z NODE_AUTH_TOKEN}" ]] ; then
echo "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}" >> ~/.npmrc
echo "registry=https://registry.npmjs.org/" >> ~/.npmrc
echo "always-auth=true" >> ~/.npmrc
npm whoami

# Release packages
for p in packages/* ; do
  pushd $p
  echo "Publishing $p"
  npm publish --dry-run
  popd
done

# Restore git
# git restore -s@ -SW  -- packages examples
