import type { Hookable } from 'hookable'
import type { Ignore } from 'ignore'
import type { Nitro } from 'nitropack'
import type { NuxtHooks, NuxtLayout, NuxtMiddleware } from './hooks'
import type { NuxtOptions } from './config'

export interface Nuxt {
  // Private fields.
  _version: string
  _ignore?: Ignore
  _nitro?: Nitro

  /** The resolved Nuxt configuration. */
  options: NuxtOptions
  hooks: Hookable<NuxtHooks>
  hook: Nuxt['hooks']['hook']
  callHook: Nuxt['hooks']['callHook']
  addHooks: Nuxt['hooks']['addHooks']

  ready: () => Promise<void>
  close: () => Promise<void>

  /** The production or development server. */
  server?: any

  vfs: Record<string, string>
}

export interface NuxtTemplate<Options = Record<string, any>> {
  /** @deprecated filename */
  fileName?: string
  /** @deprecated whether template is custom or a nuxt core template */
  custom?: boolean
  /** resolved output file path (generated) */
  dst?: string
  /** The target filename once the template is copied into the Nuxt buildDir */
  filename?: string
  /** An options object that will be accessible within the template via `<% options %>` */
  options?: Options
  /** The resolved path to the source file to be template */
  src?: string
  /** Provided compile option instead of src */
  getContents?: (data: Options) => string | Promise<string>
  /** Write to filesystem */
  write?: boolean
}

export interface ResolvedNuxtTemplate<Options = Record<string, any>> extends NuxtTemplate<Options> {
  filename: string
  dst: string
}

export interface NuxtPlugin {
  /** @deprecated use mode */
  ssr?: boolean
  src: string
  mode?: 'all' | 'server' | 'client'
}

export interface NuxtApp {
  mainComponent?: string | null
  rootComponent?: string | null
  errorComponent?: string | null
  dir: string
  extensions: string[]
  plugins: NuxtPlugin[]
  layouts: Record<string, NuxtLayout>
  middleware: NuxtMiddleware[]
  templates: NuxtTemplate[]
  configs: string[]
}

type _TemplatePlugin<Options> = Omit<NuxtPlugin, 'src'> & NuxtTemplate<Options>
export interface NuxtPluginTemplate<Options = Record<string, any>> extends _TemplatePlugin<Options> { }
