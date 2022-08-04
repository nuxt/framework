import { Nuxt, NuxtApp } from '@nuxt/schema'
import { createTransformer } from 'unctx/transform'
import { createUnplugin } from 'unplugin'

export const UnctxTransformPlugin = (nuxt: Nuxt) => {
  const transformer = createTransformer({
    asyncFunctions: ['defineNuxtPlugin', 'defineNuxtRouteMiddleware']
  })

  let app: NuxtApp | undefined
  nuxt.hook('app:resolve', (_app) => { app = _app })

  return createUnplugin((options: { sourcemap?: boolean } = {}) => ({
    name: 'unctx:transfrom',
    enforce: 'post',
    transformInclude (id) {
      return Boolean(app?.plugins.find(i => matchesPath(id, i.src)) || app.middleware.find(m => matchesPath(id, m.path)))
    },
    transform (code, id) {
      const result = transformer.transform(code)
      if (result) {
        return {
          code: result.code,
          map: options.sourcemap && result.magicString.generateMap({ source: id, includeContent: true })
        }
      }
    }
  }))
}

const matchesPath = (path: string, withoutExt: string) => path === withoutExt || path.startsWith(withoutExt + '.')
