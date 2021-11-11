
import type { Nuxt, NuxtApp } from '@nuxt/kit'

import { importName, importSources } from './template.utils'

type TemplateContext = {
  nuxt: Nuxt;
  app: NuxtApp;
}

// TODO: Use an alias
export const appComponentTemplate = {
  filename: 'app-component.mjs',
  getContents (ctx: TemplateContext) {
    return `export { default } from '${ctx.app.mainComponent}'`
  }
}
// TODO: Use an alias
export const rootComponentTemplate = {
  filename: 'root-component.mjs',
  getContents (ctx: TemplateContext) {
    return `export { default } from '${ctx.app.rootComponent}'`
  }
}

export const cssTemplate = {
  filename: 'css.mjs',
  getContents (ctx: TemplateContext) {
    return ctx.nuxt.options.css.map(i => `import '${i.src || i}';`).join('\n')
  }
}

export const clientPluginTemplate = {
  filename: 'plugins/client.mjs',
  getContents (ctx: TemplateContext) {
    const clientPlugins = ctx.app.plugins.filter(p => !p.mode || p.mode !== 'server')
    return [
      importSources(clientPlugins.map(p => p.src)),
      'export default [',
      clientPlugins.map(p => importName(p.src)).join(',\n  '),
      ']'
    ].join('\n')
  }
}

export const serverPluginTemplate = {
  filename: 'plugins/server.mjs',
  getContents (ctx: TemplateContext) {
    const serverPlugins = ctx.app.plugins.filter(p => !p.mode || p.mode !== 'client')
    return [
      "import preload from '#app/plugins/preload.server'",
      importSources(serverPlugins.map(p => p.src)),
      'export default [',
      '  preload,',
      serverPlugins.map(p => importName(p.src)).join(',\n  '),
      ']'
    ].join('\n')
  }
}

export const vueDemiMockTemplate = {
  filename: 'vue-demi.mjs',
  getContents () {
    return `
export * from 'vue'
export const Vue2 = undefined
export const isVue2 = false
export const isVue3 = true
export const install = () => {}

export function set(target, key, val) {
  if (Array.isArray(target)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  target[key] = val
  return val
}

export function del(target, key) {
  if (Array.isArray(target)) {
    target.splice(key, 1)
    return
  }
  delete target[key]
}`
  }
}

export const appViewTemplate = {
  filename: 'views/app.template.html',
  getContents () {
    return `<!DOCTYPE html>
<html {{ HTML_ATTRS }}>

<head {{ HEAD_ATTRS }}>
  {{ HEAD }}
</head>

<body {{ BODY_ATTRS }}>
  {{ APP }}
</body>

</html>
`
  }
}
