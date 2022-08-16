import { promises as fsp } from 'node:fs'
import { resolve, dirname } from 'pathe'
import consola from 'consola'
import { hash } from 'ohash'
import type { Nuxt } from '@nuxt/schema'
import { rmRecursive } from './fs'

export interface NuxtProjectManifest {
  _hash: string
  project: {
    rootDir: string
  },
  versions: {
    nuxt: string
  }
}

export async function cleanupNuxtDirs (rootDir: string) {
  consola.info('Cleaning up generated nuxt files and caches...')

  await rmRecursive([
    '.nuxt',
    '.output',
    'dist',
    'node_modules/.vite',
    'node_modules/.cache'
  ].map(dir => resolve(rootDir, dir)))
}

export function resolveNuxtManifest (nuxt: Nuxt): NuxtProjectManifest {
  const manifest: NuxtProjectManifest = {
    _hash: null,
    project: {
      rootDir: nuxt.options.rootDir
    },
    versions: {
      nuxt: nuxt._version
    }
  }
  manifest._hash = hash(manifest)
  return manifest
}

export async function writeNuxtManifest (nuxt: Nuxt): Promise<NuxtProjectManifest> {
  const manifest = resolveNuxtManifest(nuxt)
  const manifestPath = resolve(nuxt.options.buildDir, 'nuxt.json')
  await fsp.mkdir(dirname(manifestPath), { recursive: true })
  await fsp.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')
  return manifest
}

export async function loadNuxtManifest (buildDir: string): Promise<NuxtProjectManifest | null> {
  const manifestPath = resolve(buildDir, 'nuxt.json')
  const manifest: NuxtProjectManifest | null = await fsp.readFile(manifestPath, 'utf-8')
    .then(data => JSON.parse(data) as NuxtProjectManifest)
    .catch(() => null)
  return manifest
}
