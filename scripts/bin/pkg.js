#!/usr/bin/env node
const { resolve } = require('path')
const { readdir } = require('fs/promises')
const mri = require('mri')
const { build } = require('jiti')(__dirname)('../build')

async function main () {
  const args = mri(process.argv.splice(2))

  if (args.all) {
    const pkgsDir = resolve(__dirname, '../../packages')
    const pkgs = await readdir(pkgsDir)
    for (const pkg of pkgs) {
      await build(resolve(pkgsDir, pkg), args.stub)
    }
  } else {
    await build(resolve(process.cwd(), args._[0] || '.'), args.stub)
  }
}

main().catch(console.error)
