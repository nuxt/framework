import { resolve, dirname } from 'path'
import { existsSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'fs'
import { exec } from 'child_process'
import defu from 'defu'
import hash from 'object-hash'
import type { LoadNuxtOptions, NuxtConfig } from '@nuxt/kit'

export function fixtureDir (name: string) {
  return resolve(__dirname, 'fixtures', name)
}

export async function loadFixture (opts?: LoadNuxtOptions, unhashedConfig?: NuxtConfig) {
  const buildId = hash({ c: opts.config, v: opts.version, d: opts.dev })
  const buildDir = resolve(opts.rootDir, '.nuxt', buildId)
  const { loadNuxt } = await import('@nuxt/kit')
  const nuxt = await loadNuxt(defu(opts, { config: { buildDir, ...unhashedConfig } }))
  return nuxt
}

export async function buildFixture (opts?: LoadNuxtOptions, unhashedConfig?: NuxtConfig) {
  const lockFile = resolve(opts.rootDir, '.buildlock')
  const pid = readSync(lockFile)

  if (pid && isAlive(pid)) {
    // Another process is building it
    await waitForPID(pid)
  }

  const nuxt = await loadFixture({ ...opts, dev: false, ready: false }, unhashedConfig)

  const integrity = await gitHead() // TODO: Calculate hash from project source
  const integrityFile = resolve(nuxt.options.buildDir, '.integrity')
  const lastBuildIntegrity = readSync(integrityFile)
  if (integrity === lastBuildIntegrity) {
    return // Nothing changed
  }

  // Build nuxt
  mkdirpSync(dirname(lockFile))
  writeFileSync(lockFile, process.pid + '', 'utf8')
  const { buildNuxt } = await import('@nuxt/kit')
  await nuxt.ready()
  await buildNuxt(nuxt)
  await writeFileSync(integrityFile, integrity)
  existsSync(lockFile) && rmSync(lockFile)
}

function mkdirpSync (dir) {
  if (!existsSync(dir)) {
    mkdirpSync(dirname(dir))
    mkdirSync(dir)
  }
}

function readSync (file) {
  return existsSync(file) && readFileSync(file, 'utf8')
}

function isAlive (pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    return false
  }
}

function waitForPID (pid, interval = 100) {
  return new Promise((resolve) => {
    const t = setInterval(() => {
      if (!isAlive(pid)) {
        clearInterval(t)
        resolve(true)
      }
    }, interval)
  })
}

function gitHead (): Promise<string> {
  return new Promise((resolve, reject) => {
    exec('git rev-parse HEAD', (err, stdout) => {
      if (err) {
        reject(err)
      } else {
        resolve(stdout.trim())
      }
    })
  })
}
