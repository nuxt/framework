import { statSync } from 'fs'
import { resolve } from 'pathe'
import { defineNuxtModule, resolveAlias } from '@nuxt/kit'
import type { Component, ComponentsDir, ComponentsOptions } from '@nuxt/schema'
import { componentsTypeTemplate, componentsClientTemplate, componentsServerTemplate } from './templates'
import { scanComponents } from './scan'
import { loaderPlugin } from './loader'

const isPureObjectOrString = (val: any) => (!Array.isArray(val) && typeof val === 'object') || typeof val === 'string'
const isDirectory = (p: string) => { try { return statSync(p).isDirectory() } catch (_e) { return false } }

export default defineNuxtModule<ComponentsOptions>({
  meta: {
    name: 'components',
    configKey: 'components'
  },
  defaults: {
    dirs: ['~/components']
  },
  setup (options, nuxt) {
    let componentDirs = []
    let components: Component[] = []

    // Resolve dirs
    nuxt.hook('app:resolve', async () => {
      await nuxt.callHook('components:dirs', options.dirs)

      componentDirs = options.dirs.filter(isPureObjectOrString).map((dir) => {
        const dirOptions: ComponentsDir = typeof dir === 'object' ? dir : { path: dir }
        const dirPath = resolveAlias(dirOptions.path, nuxt.options.alias)
        const transpile = typeof dirOptions.transpile === 'boolean' ? dirOptions.transpile : 'auto'
        const extensions = (dirOptions.extensions || nuxt.options.extensions).map(e => e.replace(/^\./g, ''))

        dirOptions.level = Number(dirOptions.level || 0)

        const present = isDirectory(dirPath)
        if (!present && dirOptions.path !== '~/components') {
          // eslint-disable-next-line no-console
          console.warn('Components directory not found: `' + dirPath + '`')
        }

        return {
          ...dirOptions,
          // TODO: https://github.com/nuxt/framework/pull/251
          enabled: true,
          path: dirPath,
          extensions,
          pattern: dirOptions.pattern || `**/*.{${extensions.join(',')},}`,
          ignore: [
            '**/*.stories.{js,ts,jsx,tsx}', // ignore storybook files
            '**/*{M,.m,-m}ixin.{js,ts,jsx,tsx}', // ignore mixins
            '**/*.{spec,test}.{js,ts,jsx,tsx}', // ignore tests
            '**/*.d.ts', // .d.ts files
            // TODO: support nuxt ignore patterns
            ...(dirOptions.ignore || [])
          ],
          transpile: (transpile === 'auto' ? dirPath.includes('node_modules') : transpile)
        }
      }).filter(d => d.enabled)

      nuxt.options.build!.transpile!.push(...componentDirs.filter(dir => dir.transpile).map(dir => dir.path))
    })

    // Scan components and add to plugin
    nuxt.hook('app:templates', async (app) => {
      components = await scanComponents(componentDirs, nuxt.options.srcDir!)
      await nuxt.callHook('components:extend', components)

      app.templates.push({
        ...componentsTypeTemplate,
        options: { components, buildDir: nuxt.options.buildDir }
      })

      if (!components.length) {
        return
      }

      app.templates.push({
        ...componentsClientTemplate,
        options: { components }
      })

      app.templates.push({
        ...componentsServerTemplate,
        options: { components }
      })

      app.templates.push({
        ...componentsTypeTemplate,
        options: { components, buildDir: nuxt.options.buildDir }
      })

      app.plugins.push({ src: '#build/components-client', mode: 'client' })
      app.plugins.push({ src: '#build/components-server', mode: 'server' })
    })

    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolve(nuxt.options.buildDir, 'components.d.ts') })
    })

    // Watch for changes
    nuxt.hook('builder:watch', async (event, path) => {
      if (!['add', 'unlink'].includes(event)) {
        return
      }
      const fPath = resolve(nuxt.options.rootDir, path)
      if (componentDirs.find(dir => fPath.startsWith(dir.path))) {
        await nuxt.callHook('builder:generateApp')
      }
    })

    const getComponents = () => components

    nuxt.hook('vite:extendConfig', (config, { isClient }) => {
      config.plugins = config.plugins || []
      config.plugins.push(loaderPlugin.vite({
        getComponents,
        mode: isClient ? 'client' : 'server'
      }))
    })

    nuxt.hook('webpack:config', (configs) => {
      configs.forEach((config) => {
        config.plugins = config.plugins || []
        config.plugins.push(loaderPlugin.webpack({
          getComponents,
          mode: config.name === 'client' ? 'client' : 'server'
        }))
      })
    })
  }
})
