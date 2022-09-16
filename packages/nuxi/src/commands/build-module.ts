import { promises as fsp } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'pathe'
import consola from 'consola'

import { writeModuleTypes, writeModuleCJSStub, loadUnbuild } from '../utils/build-module'
import { defineNuxtCommand } from './index'

import type { NuxtModule } from '@nuxt/schema'

export default defineNuxtCommand({
  meta: {
    name: 'build-module',
    usage: 'npx nuxi build-module [--stub] [--outDir] [rootDir]',
    description: 'Build a nuxt module for development & production'
  },
  async invoke (args) {
    const rootDir = resolve(args._[0] || '.')
    const outDir = args.outDir || 'dist'

    const { build } = await loadUnbuild(rootDir)
    
    await build(rootDir, false, {
      declaration: true,
      stub: args.stub,
      entries: [
        'src/module',
        { input: 'src/runtime/', outDir: `${outDir}/runtime`, ext: 'mjs' }
      ],
      rollup: {
        emitCJS: false,
        cjsBridge: true
      },
      externals: [
        '@nuxt/schema',
        '@nuxt/schema-edge',
        '@nuxt/kit',
        '@nuxt/kit-edge',
        'nuxt',
        'nuxt-edge',
        'nuxt3',
        'vue'
      ],
      hooks: {
        async 'rollup:done' (ctx) {
          // Generate CommonJS setup
          await writeModuleCJSStub(ctx.options.outDir)
  
          // Load module meta
          const moduleEntryPath = resolve(ctx.options.outDir, 'module.mjs')
          const moduleFn: NuxtModule<any> = await import(
            pathToFileURL(moduleEntryPath).toString()
          ).then(r => r.default || r).catch((err) => {
            consola.error(err)
            consola.error('Cannot load module. Please check dist:', moduleEntryPath)
            return null
          })

          // If module is not a function, return error
          if (!moduleFn) return consola.error('It seems that `export default defineNuxtModule()` is not used in module.ts. Please make sure to define it as a default export.')

          const moduleMeta = await moduleFn.getMeta()
  
          // Enhance meta using package.json
          if (ctx.pkg) {
            moduleMeta.name = moduleMeta?.name ?? ctx.pkg.name
            moduleMeta.version = moduleMeta?.version ?? ctx.pkg.version
          }
  
          // Write meta
          const metaFile = resolve(ctx.options.outDir, 'module.json')
          await fsp.writeFile(metaFile, JSON.stringify(moduleMeta, null, 2), 'utf8')
  
          // Generate types
          await writeModuleTypes(ctx.options.outDir, {
            meta: moduleMeta
          })
        }
      }
    })
  }
})