import { defineNuxtModule, resolveModule, addServerMiddleware } from '@nuxt/kit'
import { resolve } from 'upath'

export default defineNuxtModule({
  name: 'content',
  defaults: {
    dir: 'content'
  },
  setup (_, nuxt) {
    const runtimeDir = resolve(__dirname, './runtime')

    nuxt.options.alias['#content'] = runtimeDir

    nuxt.hook('nitro:context', (ctx) => {
      // ctx.assets.dirs.content = {
      //   dir: resolve(nuxt.options.rootDir, 'content')
      // }
      ctx.storage.mounts.content = {
        // Prod TODO: unstorage driver for nitro assets
        driver: 'fs',
        driverOptions: {
          base: resolve(nuxt.options.rootDir, 'content')
        }
      }
    })

    for (const api of ['get', 'list']) {
      addServerMiddleware({
        path: `/api/_content/${api}`,
        handler: resolveModule(`./server/api/${api}`, { paths: runtimeDir })
      })
    }
  }
})
