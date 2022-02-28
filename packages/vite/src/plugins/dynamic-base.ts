import { createUnplugin } from 'unplugin'
import escapeRE from 'escape-string-regexp'
import type { Plugin } from 'vite'
import MagicString from 'magic-string'

interface DynamicBasePluginOptions {
  env: 'dev' | 'server' | 'client'
  devAppConfig?: Record<string, any>
  globalPublicPath?: string
}

export const RelativeAssetPlugin = function (): Plugin {
  return {
    name: 'nuxt:vite-relative-asset',
    generateBundle (_, bundle) {
      const generatedAssets = Object.entries(bundle).filter(([_, asset]) => asset.type === 'asset').map(([key]) => escapeRE(key))
      const assetRE = new RegExp(`\\/__NUXT_BASE__\\/(${generatedAssets.join('|')})`, 'g')

      for (const file in bundle) {
        const asset = bundle[file]
        if (asset.type === 'asset' && typeof asset.source === 'string' && asset.fileName.endsWith('.css')) {
          const depth = file.split('/').length - 1
          const assetBase = depth === 0 ? '.' : Array.from({ length: depth }).map(() => '..').join('/')
          const publicBase = Array.from({ length: depth + 1 }).map(() => '..').join('/')
          asset.source = asset.source
            .replace(assetRE, r => r.replace(/\/__NUXT_BASE__/g, assetBase))
            .replace(/\/__NUXT_BASE__/g, publicBase)
        }
      }
    }
  }
}

const VITE_ASSET_RE = /^export default ["'](__VITE_ASSET.*)["']$/

export const DynamicBasePlugin = createUnplugin(function (options: DynamicBasePluginOptions) {
  return {
    name: 'nuxt:dynamic-base-path',
    resolveId (id) {
      if (id.startsWith('/__NUXT_BASE__')) {
        return id.replace('/__NUXT_BASE__', '')
      }
      return null
    },
    enforce: 'post',
    transform (code, id) {
      const s = new MagicString(code)
      if (options.globalPublicPath && id.includes('entry.ts')) {
        s.prepend(`import { joinURL } from "ufo";${options.globalPublicPath} = joinURL(NUXT_BASE, NUXT_CONFIG.app.buildAssetsDir);`)
      }

      const assetId = code.match(VITE_ASSET_RE)
      if (assetId) {
        s.overwrite(0, code.length, `import { joinURL } from "ufo";export default joinURL(NUXT_BASE, NUXT_CONFIG.app.buildAssetsDir, "${assetId[1]}".replace("/__NUXT_BASE__", ""));`)
      }

      if (code.includes('NUXT_BASE') && !code.includes('const NUXT_BASE =')) {
        s.prepend('const NUXT_BASE = NUXT_CONFIG.app.cdnURL || NUXT_CONFIG.app.baseURL;')

        if (options.env === 'dev') {
          s.prepend(`const NUXT_CONFIG = { app: ${JSON.stringify(options.devAppConfig)} };`)
        } else if (options.env === 'server') {
          s.prepend('import NUXT_CONFIG from "#config";')
        } else {
          s.prepend('const NUXT_CONFIG = __NUXT__.config;')
        }
      }

      if (id === 'vite/preload-helper') {
        // Define vite base path as buildAssetsUrl (i.e. including _nuxt/)
        const match = code.match(/const base = ['"]\/__NUXT_BASE__\/['"]/)
        if (match?.[0]) {
          s.overwrite(
            match.index,
            match.index + match[0].length,
            'import { joinURL } from "ufo";' +
          'const base = joinURL(NUXT_BASE, NUXT_CONFIG.app.buildAssetsDir);'
          )
        }
      }

      // Sanitize imports
      replace(s, /from *['"]\/__NUXT_BASE__(\/[^'"]*)['"]/g, 'from "$1"')

      // Dynamically compute string URLs featuring baseURL
      for (const delimiter of ['`', '"', "'"]) {
        const delimiterRE = new RegExp(`${delimiter}([^${delimiter}]*)\\/__NUXT_BASE__\\/([^${delimiter}]*)${delimiter}`, 'g')
        /* eslint-disable-next-line no-template-curly-in-string */
        replace(s, delimiterRE, '`$1${NUXT_BASE}$2`')
      }

      if (code === s.toString()) {
        return
      }
      return {
        code: s.toString(),
        map: s.generateMap()
      }
    }
  }
})

function replace (s: MagicString, regex: RegExp | string, replacement: string | ((substring: string, ...args: any[]) => string)) {
  function getReplacement (match: RegExpMatchArray) {
    if (typeof replacement === 'string') {
      return replacement.replace(/\$(\d+)/g, (_, i) => match[+i])
    } else {
      return replacement(...match as unknown as [string])
    }
  }
  if (typeof regex !== 'string' && regex.global) {
    const matches = Array.from(s.original.matchAll(regex))
    matches.forEach((match) => {
      if (match.index != null) {
        s.overwrite(match.index, match.index + match[0].length, getReplacement(match))
      }
    })
  } else {
    const match = s.original.match(regex)
    if (match?.index != null) {
      s.overwrite(match.index, match.index + match[0].length, getReplacement(match))
    }
  }
  return s
}
