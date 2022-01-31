import { resolve } from 'pathe'
import { applyDefaults } from 'untyped'
import { loadConfig, DotenvOptions } from 'c12'
import type { NuxtOptions } from '@nuxt/schema'
import { NuxtConfigSchema } from '@nuxt/schema'
// TODO
// import { tryResolveModule, requireModule, scanRequireTree } from '../internal/cjs'

export interface LoadNuxtConfigOptions {
  /** Your project root directory (either absolute or relative to the current working directory). */
  cwd?: string

  /** The path to your `nuxt.config` file (either absolute or relative to your project `rootDir`). */
  configFile?: string

  /** Any overrides to your Nuxt configuration. */
  config?: Record<string, any>

  /** Configuration for loading dotenv */
  dotenv?: DotenvOptions | false
}

export async function loadNuxtConfig (opts: LoadNuxtConfigOptions): Promise<NuxtOptions> {
  const rootDir = resolve(process.cwd(), opts.cwd || '.')

  const { config: nuxtConfig } = await loadConfig({
    cwd: rootDir,
    name: 'nuxt',
    configFile: 'nuxt.config',
    rcFile: '.nuxtrc',
    dotenv: opts.dotenv,
    globalRc: true,
    overrides: opts.config
  })

  // Resolve and apply defaults
  return applyDefaults(NuxtConfigSchema, nuxtConfig) as NuxtOptions
}
