import { relative, resolve, join } from 'pathe'
import consola from 'consola'
import { rollup, watch as rollupWatch } from 'rollup'
import fse from 'fs-extra'
import { printFSTree } from './utils/tree'
import { getRollupConfig } from './rollup/config'
import { hl, prettyPath, serializeTemplate, writeFile, isDirectory } from './utils'
import { NitroContext } from './context'
import { scanMiddleware } from './server/middleware'

export async function prepare (nitroContext: NitroContext) {
  consola.info(`Nitro preset is ${hl(nitroContext.preset)}`)

  await cleanupDir(nitroContext.output.dir)

  if (!nitroContext.output.publicDir.startsWith(nitroContext.output.dir)) {
    await cleanupDir(nitroContext.output.publicDir)
  }

  if (!nitroContext.output.serverDir.startsWith(nitroContext.output.dir)) {
    await cleanupDir(nitroContext.output.serverDir)
  }
}

async function cleanupDir (dir: string) {
  consola.info('Cleaning up', prettyPath(dir))
  await fse.emptyDir(dir)
}

export async function generate (nitroContext: NitroContext) {
  consola.start('Generating public...')

  const clientDist = resolve(nitroContext._nuxt.buildDir, 'dist/client')
  if (await isDirectory(clientDist)) {
    await fse.copy(clientDist, join(nitroContext.output.publicDir, nitroContext._nuxt.publicPath))
  }

  const publicDir = nitroContext._nuxt.publicDir
  if (await isDirectory(publicDir)) {
    await fse.copy(publicDir, nitroContext.output.publicDir)
  }

  consola.success('Generated public ' + prettyPath(nitroContext.output.publicDir))
}

export async function build (nitroContext: NitroContext) {
  // Compile html template
  const htmlSrc = resolve(nitroContext._nuxt.buildDir, `views/${{ 2: 'app', 3: 'document' }[2]}.template.html`)
  const htmlTemplate = { src: htmlSrc, contents: '', dst: '', compiled: '' }
  htmlTemplate.dst = htmlTemplate.src.replace(/.html$/, '.mjs').replace('app.', 'document.')
  htmlTemplate.contents = nitroContext.vfs[htmlTemplate.src] || await fse.readFile(htmlTemplate.src, 'utf-8')
  await nitroContext._internal.hooks.callHook('nitro:document', htmlTemplate)
  htmlTemplate.compiled = 'export default ' + serializeTemplate(htmlTemplate.contents)
  await writeFile(htmlTemplate.dst, htmlTemplate.compiled)

  nitroContext.rollupConfig = getRollupConfig(nitroContext)
  await nitroContext._internal.hooks.callHook('nitro:rollup:before', nitroContext)
  await writeTypes(nitroContext)
  return nitroContext._nuxt.dev ? _watch(nitroContext) : _build(nitroContext)
}

async function writeTypes (nitroContext: NitroContext) {
  const routeTypes: Record<string, string[]> = {}

  const middleware = [
    ...nitroContext.scannedMiddleware,
    ...nitroContext.middleware
  ]

  for (const mw of middleware) {
    if (typeof mw.handle !== 'string') { continue }
    const relativePath = relative(nitroContext._nuxt.buildDir, mw.handle).replace(/\.[a-z]+$/, '')
    routeTypes[mw.route] = routeTypes[mw.route] || []
    routeTypes[mw.route].push(`ReturnType<typeof import('${relativePath}').default>`)
  }

  const lines = [
    'declare module \'@nuxt/nitro\' {',
    '  interface InternalApi {',
    ...Object.entries(routeTypes).map(([path, types]) => `    '${path}': ${types.join(' | ')}`),
    '  }',
    '}',
    // Makes this a module for augmentation purposes
    'export {}'
  ]

  await writeFile(join(nitroContext._nuxt.buildDir, 'nitro.d.ts'), lines.join('\n'))
}

async function _build (nitroContext: NitroContext) {
  nitroContext.scannedMiddleware = await scanMiddleware(nitroContext._nuxt.serverDir)

  consola.start('Building server...')
  const build = await rollup(nitroContext.rollupConfig).catch((error) => {
    consola.error('Rollup error: ' + error.message)
    throw error
  })

  consola.start('Writing server bundle...')
  await build.write(nitroContext.rollupConfig.output)

  consola.success('Server built')
  await printFSTree(nitroContext.output.serverDir)
  await nitroContext._internal.hooks.callHook('nitro:compiled', nitroContext)

  return {
    entry: resolve(nitroContext.rollupConfig.output.dir, nitroContext.rollupConfig.output.entryFileNames as string)
  }
}

function startRollupWatcher (nitroContext: NitroContext) {
  const watcher = rollupWatch(nitroContext.rollupConfig)
  let start: number

  watcher.on('event', (event) => {
    switch (event.code) {
      // The watcher is (re)starting
      case 'START':
        return

      // Building an individual bundle
      case 'BUNDLE_START':
        start = Date.now()
        return

      // Finished building all bundles
      case 'END':
        nitroContext._internal.hooks.callHook('nitro:compiled', nitroContext)
        consola.success('Nitro built', start ? `in ${Date.now() - start} ms` : '')
        return

      // Encountered an error while bundling
      case 'ERROR':
        consola.error('Rollup error: ' + event.error)
        // consola.error(event.error)
    }
  })
  return watcher
}

async function _watch (nitroContext: NitroContext) {
  let watcher = startRollupWatcher(nitroContext)

  nitroContext.scannedMiddleware = await scanMiddleware(nitroContext._nuxt.serverDir,
    (middleware, event) => {
      nitroContext.scannedMiddleware = middleware
      if (['add', 'addDir'].includes(event)) {
        watcher.close()
        writeTypes(nitroContext).catch(console.error)
        watcher = startRollupWatcher(nitroContext)
      }
    }
  )
}
