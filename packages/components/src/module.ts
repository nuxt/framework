import fs from 'fs'
import { defineNuxtModule, resolveAlias, addVitePlugin, addWebpackPlugin } from '@nuxt/kit'
import { resolve } from 'upath'
import { scanComponents } from './scan'
import type { Component, ComponentsDir } from './types'
import { loaderPlugin } from './loader'

const isPureObjectOrString = (val: any) => (!Array.isArray(val) && typeof val === 'object') || typeof val === 'string'
const isDirectory = (p: string) => { try { return fs.statSync(p).isDirectory() } catch (_e) { return false } }

export default defineNuxtModule({
  name: 'components',
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
        const extensions = dirOptions.extensions || ['vue'] // TODO: nuxt extensions and strip leading dot

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
      if (!components.length) {
        return
      }

      app.templates.push({
        filename: 'components.mjs',
        src: resolve(__dirname, 'runtime/components.tmpl.mjs'),
        options: { components }
      })

      app.templates.push({
        filename: 'components.d.ts',
        src: resolve(__dirname, 'runtime/components.tmpl.d.ts'),
        options: { components }
      })

      app.plugins.push({ src: '#build/components' })
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

    if (!nuxt.options.dev) {
      const options = { getComponents: () => components }
      addWebpackPlugin(loaderPlugin.webpack(options))
      addVitePlugin(loaderPlugin.vite(options))
    }
  }
})
