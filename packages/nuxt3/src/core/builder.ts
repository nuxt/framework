import chokidar from 'chokidar'
import type { Nuxt } from '@nuxt/schema'

export async function build (nuxt: Nuxt) {
  await nuxt.callHook('builder:generateApp')

  if (nuxt.options.dev) {
    watch(nuxt)
  }

  await nuxt.callHook('build:before', { nuxt }, nuxt.options.build)
  await bundle(nuxt)
  await nuxt.callHook('build:done', { nuxt })

  if (!nuxt.options.dev) {
    await nuxt.callHook('close', nuxt)
  }
}

function watch (nuxt: Nuxt) {
  const watcher = chokidar.watch(nuxt.options.srcDir, {
    ...nuxt.options.watchers.chokidar,
    cwd: nuxt.options.srcDir,
    ignoreInitial: true,
    ignored: [
      '.nuxt',
      '.output',
      'node_modules'
    ]
  })
  const watchHook = (event, path) => nuxt.callHook('builder:watch', event, path)
  watcher.on('all', watchHook)
  nuxt.hook('close', () => watcher.close())
  return watcher
}

async function bundle (nuxt: Nuxt) {
  const useVite = nuxt.options.vite !== false
  const { bundle } = await (useVite ? import('@nuxt/vite-builder') : import('@nuxt/webpack-builder'))
  try {
    return bundle(nuxt)
  } catch (error) {
    await nuxt.callHook('build:error', error)
    throw error
  }
}
