/**
 * The types in these files are a compat amalgamation of the following files:
 *
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/webpack-env/index.d.ts
 * https://github.com/vitejs/vite/blob/main/packages/vite/types/importMeta.d.ts
 */

import { WebpackHot } from './webpack'

declare global {
  interface ImportMeta {
    // Shared properties

    /** the `file:` url of the current file (similar to `__filename` but as file url) */
    url: string

    /** @deprecated - use `useRuntimeConfig` instead */
    readonly env: Record<string, string | boolean | undefined>

    // webpack specific

    /** an alias for `module.hot` - see https://webpack.js.org/api/hot-module-replacement/ */
    webpackHot?: WebpackHot | undefined
    /** the webpack major version as number */
    webpack?: number

    // vite specific

    /** access the Vite client HMR API - see https://vitejs.dev/guide/api-hmr.html */
    readonly hot?: {
      readonly data: any

      accept (): void
      accept (cb: (mod: any) => void): void
      accept (dep: string, cb: (mod: any) => void): void
      accept (deps: readonly string[], cb: (mods: any[]) => void): void

      dispose (cb: (data: any) => void): void
      decline (): void
      invalidate (): void

      on: (event: 'any', cb: (payload: any) => void) => void
    }

    /** vite glob import utility - https://vitejs.dev/guide/features.html#glob-import */
    glob?(pattern: string): Record<string, () => Promise<Record<string, any>>>
    /** vite glob import utility - https://vitejs.dev/guide/features.html#glob-import */
    globeager?(pattern: string): Record<string, Record<string, any>>
  }
}
