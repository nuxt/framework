import { Nuxt, NuxtApp } from '@nuxt/schema'
import { createTransformer } from 'unctx/transform'
import { createUnplugin } from 'unplugin'

export const UnctxTransformPlugin = createUnplugin((nuxt: Nuxt) => {
  const transformer = createTransformer({
    asyncFunctions: ['defineNuxtPlugin', 'withAsyncContext', 'callAsync']
  })

  let app: NuxtApp | undefined
  nuxt.hook('app:resolve', (_app) => { app = _app })

  return {
    name: 'unctx:transfrom',
    enforce: 'post',
    transformInclude (id) {
      return !!app?.plugins.find(i => i.src === id)
    },
    transform (code) {
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
