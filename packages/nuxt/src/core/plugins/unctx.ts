import { Nuxt, NuxtApp, NuxtMiddleware } from '@nuxt/schema'
import { createTransformer } from 'unctx/transform'
import { createUnplugin } from 'unplugin'

export const UnctxTransformPlugin = (nuxt: Nuxt) => {
  const transformer = createTransformer({
    asyncFunctions: ['defineNuxtPlugin', 'defineNuxtRouteMiddleware']
  })

  let app: NuxtApp | undefined
  let middleware: NuxtMiddleware[] = []
  nuxt.hook('app:resolve', (_app) => { app = _app })
  nuxt.hook('pages:middleware:extend', (_middlewares) => { middleware = _middlewares })

  return createUnplugin(() => ({
    name: 'unctx:transfrom',
    enforce: 'post',
    transformInclude (id) {
      return Boolean(app?.plugins.find(i => i.src === id) || middleware.find(m => m.path === id))
    },
    transform (code, id) {
      const result = transformer.transform(code)
      if (result) {
        return {
          code: result.code,
          map: result.magicString.generateMap({ source: id, includeContent: true })
        }
      }
    }
  }))
}
