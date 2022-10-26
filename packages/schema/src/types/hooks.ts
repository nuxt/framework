import type { TSConfig } from 'pkg-types'
import type { InlineConfig as ViteInlineConfig, ViteDevServer } from 'vite'
import type { Manifest } from 'vue-bundle-renderer'
import type { EventHandler } from 'h3'
import type { Nuxt, NuxtApp, ResolvedNuxtTemplate } from './nuxt'
import type { Preset as ImportPreset, Import } from 'unimport'
import type { Nitro, NitroConfig } from 'nitropack'
import type { Component, ComponentsOptions } from './components'
import { NuxtCompatibility, NuxtCompatibilityIssues } from '..'

export type HookResult = Promise<void> | void

// https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html
export type TSReference = { types: string } | { path: string }

export type NuxtPage = {
  name?: string
  path: string
  file: string
  meta?: Record<string, any>
  alias?: string[] | string
  redirect?: string
  children?: NuxtPage[]
}

export type NuxtMiddleware = {
  name: string
  path: string
  global?: boolean
}

export type NuxtLayout = {
  name: string
  file: string
}

export interface ImportPresetWithDeprecation extends ImportPreset {
  /**
   * @deprecated renamed to `imports`
   */
  names?: string[]
}

export interface GenerateAppOptions {
  filter?: (template: ResolvedNuxtTemplate<any>) => boolean
}

export interface NuxtHooks {
  // Kit
  'kit:compatibility': (compatibility: NuxtCompatibility, issues: NuxtCompatibilityIssues) => HookResult

  // nuxt
  'app:resolve': (app: NuxtApp) => HookResult
  'app:templates': (app: NuxtApp) => HookResult
  'app:templatesGenerated': (app: NuxtApp) => HookResult
  'builder:generateApp': (options?: GenerateAppOptions) => HookResult
  'pages:extend': (pages: NuxtPage[]) => HookResult
  'build:manifest': (manifest: Manifest) => HookResult
  'server:devHandler': (handler: EventHandler) => HookResult

  // Auto imports
  'imports:sources': (presets: ImportPresetWithDeprecation[]) => HookResult
  'imports:extend': (imports: Import[]) => HookResult
  'imports:dirs': (dirs: string[]) => HookResult

  // Components
  'components:dirs': (dirs: ComponentsOptions['dirs']) => HookResult
  'components:extend': (components: Component[]) => HookResult

  // nitropack
  'nitro:config': (nitroConfig: NitroConfig) => HookResult
  'nitro:init': (nitro: Nitro) => HookResult
  'nitro:build:before': (nitro: Nitro) => HookResult

  // nuxi
  'build:error': (error: Error) => HookResult
  'prepare:types': (options: { references: TSReference[], declarations: string[], tsConfig: TSConfig }) => HookResult

  // vite
  'vite:extend': (viteBuildContext: { nuxt: Nuxt, config: ViteInlineConfig }) => HookResult
  'vite:extendConfig': (viteInlineConfig: ViteInlineConfig, env: { isClient: boolean, isServer: boolean }) => HookResult
  'vite:serverCreated': (viteServer: ViteDevServer, env: { isClient: boolean, isServer: boolean }) => HookResult
}

export type NuxtHookName = keyof NuxtHooks
