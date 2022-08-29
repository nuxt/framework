import type { AddressInfo } from 'node:net'
import { RequestListener } from 'node:http'
import { resolve, relative, normalize } from 'pathe'
import chokidar from 'chokidar'
import { debounce } from 'perfect-debounce'
import type { Nuxt } from '@nuxt/schema'
import consola from 'consola'
import { withTrailingSlash } from 'ufo'
import { setupDotenv } from 'c12'
import { showBanner } from '../utils/banner'
import { writeTypes } from '../utils/prepare'
import { loadKit } from '../utils/kit'
import { importModule } from '../utils/cjs'
import { overrideEnv } from '../utils/env'
import { writeNuxtManifest, loadNuxtManifest, cleanupNuxtDirs } from '../utils/nuxt'
import { defineNuxtCommand } from './index'

export default defineNuxtCommand({
  meta: {
    name: 'dev',
    usage: 'npx nuxi dev [rootDir] [--clipboard] [--open, -o] [--port, -p] [--host, -h] [--https] [--ssl-cert] [--ssl-key]',
    description: 'Run nuxt development server'
  },
  async invoke (args) {
    overrideEnv('development')

    const { listen } = await import('listhen')
    let currentHandler: RequestListener | undefined
    let loadingMessage = 'Nuxt is starting...'
    const loadingHandler: RequestListener = async (_req, res) => {
      const { loading: loadingTemplate } = await importModule('@nuxt/ui-templates')
      res.setHeader('Content-Type', 'text/html; charset=UTF-8')
      res.statusCode = 503 // Service Unavailable
      res.end(loadingTemplate({ loading: loadingMessage }))
    }
    const serverHandler: RequestListener = (req, res) => {
      return currentHandler ? currentHandler(req, res) : loadingHandler(req, res)
    }

    const rootDir = resolve(args._[0] || '.')
    await setupDotenv({ cwd: rootDir })

    const listener = await listen(serverHandler, {
      showURL: false,
      clipboard: args.clipboard,
      open: args.open || args.o,
      port: args.port || args.p || process.env.NUXT_PORT,
      hostname: args.host || args.h || process.env.NUXT_HOST,
      https: Boolean(args.https),
      certificate: (args['ssl-cert'] && args['ssl-key']) && {
        cert: args['ssl-cert'],
        key: args['ssl-key']
      }
    })

    const { loadNuxt, buildNuxt } = await loadKit(rootDir)

    let currentNuxt: Nuxt
    const showURL = () => {
      listener.showURL({
        // TODO: Normalize URL with trailing slash within schema
        baseURL: withTrailingSlash(currentNuxt?.options.app.baseURL) || '/'
      })
    }
    const load = async (isRestart: boolean, reason?: string) => {
      try {
        loadingMessage = `${reason ? reason + '. ' : ''}${isRestart ? 'Restarting' : 'Starting'} nuxt...`
        currentHandler = undefined
        if (isRestart) {
          consola.info(loadingMessage)
        }
        if (currentNuxt) {
          await currentNuxt.close()
        }
        currentNuxt = await loadNuxt({ rootDir, dev: true, ready: false })
        if (!isRestart) {
          showURL()
        }

        // Write manifest and also check if we need cache invalidation
        if (!isRestart) {
          const previousManifest = await loadNuxtManifest(currentNuxt.options.buildDir)
          const newManifest = await writeNuxtManifest(currentNuxt)
          if (previousManifest && newManifest && previousManifest._hash !== newManifest._hash) {
            await cleanupNuxtDirs(currentNuxt.options.rootDir)
          }
        }

        await currentNuxt.ready()

        await currentNuxt.hooks.callHook('listen', listener.server, listener)
        const address = listener.server.address() as AddressInfo
        currentNuxt.options.server.port = address.port
        currentNuxt.options.server.host = address.address

        await Promise.all([
          writeTypes(currentNuxt).catch(console.error),
          buildNuxt(currentNuxt)
        ])
        currentHandler = currentNuxt.server.app
        if (isRestart && args.clear !== false) {
          showBanner()
          showURL()
        }
      } catch (err) {
        consola.error(`Cannot ${isRestart ? 'restart' : 'start'} nuxt: `, err)
        currentHandler = undefined
        loadingMessage = 'Error while loading nuxt. Please check console and fix errors.'
      }
    }

    // Watch for config changes
    // TODO: Watcher service, modules, and requireTree
    const dLoad = debounce(load)
    const watcher = chokidar.watch([rootDir], { ignoreInitial: true, depth: 1 })
    watcher.on('all', (event, _file) => {
      if (!currentNuxt) { return }
      const file = normalize(_file)
      const buildDir = withTrailingSlash(normalize(currentNuxt.options.buildDir))
      if (file.startsWith(buildDir)) { return }
      const relativePath = relative(rootDir, file)
      if (file.match(/(nuxt\.config\.(js|ts|mjs|cjs)|\.nuxtignore|\.env|\.nuxtrc)$/)) {
        dLoad(true, `${relativePath} updated`)
      }

      const isDirChange = ['addDir', 'unlinkDir'].includes(event)
      const isFileChange = ['add', 'unlink'].includes(event)
      const reloadDirs = [currentNuxt.options.dir.pages, 'components', 'composables']
        .map(d => resolve(currentNuxt.options.srcDir, d))

      if (isDirChange) {
        if (reloadDirs.includes(file)) {
          dLoad(true, `Directory \`${relativePath}/\` ${event === 'addDir' ? 'created' : 'removed'}`)
        }
      } else if (isFileChange) {
        if (file.match(/(app|error|app\.config)\.(js|ts|mjs|jsx|tsx|vue)$/)) {
          dLoad(true, `\`${relativePath}\` ${event === 'add' ? 'created' : 'removed'}`)
        }
      }
    })

    await load(false)

    return 'wait' as const
  }
})
