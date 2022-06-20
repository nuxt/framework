import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'

interface DynamicBasePluginOptions {
  globalPublicPath?: string
  sourcemap?: boolean
}

export const DynamicBasePlugin = createUnplugin(function (options: DynamicBasePluginOptions = {}) {
  return {
    name: 'nuxt:dynamic-base-path',
    enforce: 'post',
    transform (code, id) {
      const s = new MagicString(code)

      if (options.globalPublicPath && id.includes('paths.mjs') && code.includes('const appConfig = ')) {
        s.append(`${options.globalPublicPath} = buildAssetsURL();\n`)
      }

      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: options.sourcemap && s.generateMap({ source: id, includeContent: true })
        }
      }
    }
  }
})
