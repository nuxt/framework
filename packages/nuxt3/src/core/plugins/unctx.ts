import { Nuxt, NuxtApp, NuxtMiddleware } from '@nuxt/schema'
import { createTransformer } from 'unctx/transform'
import { createUnplugin } from 'unplugin'

export const UnctxTransformPlugin = createUnplugin((nuxt: Nuxt) => {
  const transformer = createTransformer({
    asyncFunctions: ['defineNuxtPlugin', 'defineNuxtRouteMiddleware', 'withAsyncContext', 'callAsync']
  })

  let app: NuxtApp | undefined
  let middlewares: NuxtMiddleware[] = []
  nuxt.hook('app:resolve', (_app) => { app = _app })
  nuxt.hook('pages:middleware:extend', (_middlewares) => { middlewares = _middlewares })
  return {
    name: 'unctx:transfrom',
    enforce: 'post',
    transformInclude (id) {
      return !!(app?.plugins.find(i => i.src === id) || middlewares.find(m => m.path === id))
    },
    transform (code, id) {
      const result = transformer.transform(code)
      if (result) {
        return {
          code: result.code,
          map: result.magicString.generateMap()
        }
      }
    }
  }
})
