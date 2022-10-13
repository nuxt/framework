import { relative } from 'pathe'
import type { Nuxt, ModuleContainer } from '@nuxt/schema'
import { chainFn } from '../internal/task'
import { addTemplate } from '../template'
import { addLayout } from '../layout'
import { addServerMiddleware } from '../nitro'
import { isNuxt2 } from '../compatibility'
import { addPluginTemplate } from '../plugin'
import { useNuxt } from '../context'
import { installModule } from './install'

const MODULE_CONTAINER_KEY = '__module_container__'

export function useModuleContainer (nuxt: Nuxt = useNuxt()): ModuleContainer {
  // @ts-ignore
  if (nuxt[MODULE_CONTAINER_KEY]) { return nuxt[MODULE_CONTAINER_KEY] }

  async function requireModule (moduleOpts: any) {
    let src, inlineOptions
    if (typeof moduleOpts === 'string') {
      src = moduleOpts
    } else if (Array.isArray(moduleOpts)) {
      [src, inlineOptions] = moduleOpts
    } else if (typeof moduleOpts === 'object') {
      if (moduleOpts.src || moduleOpts.handler) {
        src = moduleOpts.src || moduleOpts.handler
        inlineOptions = moduleOpts.options
      } else {
        src = moduleOpts
      }
    } else {
      src = moduleOpts
    }
    await installModule(src, inlineOptions)
  }

  const container: ModuleContainer = {
    nuxt,
    options: nuxt.options,

    ready () { return Promise.resolve() },
    addVendor () {},

    requireModule,
    addModule: requireModule,

    addServerMiddleware,

    addTemplate (template) {
      if (typeof template === 'string') {
        template = { src: template }
      }
      if (template.write === undefined) {
        template.write = true
      }
      return addTemplate(template)
    },

    addPlugin (pluginTemplate) {
      return addPluginTemplate(pluginTemplate)
    },

    addLayout (tmpl, name) {
      return addLayout(tmpl, name)
    },

    addErrorLayout (dst) {
      const relativeBuildDir = relative(nuxt.options.rootDir, nuxt.options.buildDir)
      nuxt.options.ErrorPage = `~/${relativeBuildDir}/${dst}`
    },

    extendBuild (fn) {
      // @ts-ignore
      nuxt.options.build.extend = chainFn(nuxt.options.build.extend, fn)

      if (!isNuxt2(nuxt)) {
        console.warn('[kit] [compat] Using `extendBuild` in Nuxt 3 has no effect. Instead call extendWebpackConfig and extendViteConfig.')
      }
    },

    extendRoutes (fn) {
      if (isNuxt2(nuxt)) {
        nuxt.options.router.extendRoutes = chainFn(nuxt.options.router.extendRoutes, fn)
      } else {
        nuxt.hook('pages:extend', async (pages, ...args) => {
          const maybeRoutes = await fn(pages, ...args)
          if (maybeRoutes) {
            console.warn('[kit] [compat] Using `extendRoutes` in Nuxt 3 needs to directly modify first argument instead of returning updated routes. Skipping extended routes.')
          }
        })
      }
    }
  }

  // @ts-ignore
  nuxt[MODULE_CONTAINER_KEY] = container

  // @ts-ignore
  return nuxt[MODULE_CONTAINER_KEY]
}
