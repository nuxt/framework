import { templateUtils } from '@nuxt/kit'
import type { Nuxt, NuxtApp } from '@nuxt/schema'
import { genArrayFromRaw, genDynamicImport, genExport, genImport, genObjectFromRawEntries, genString } from 'knitwork'
import { isAbsolute, join, relative } from 'pathe'
import escapeRE from 'escape-string-regexp'

import { getImportName, resolveMiddleware } from './utils'

export interface TemplateContext {
  nuxt: Nuxt
  app: NuxtApp
}

export const vueShim = {
  filename: 'types/vue-shim.d.ts',
  getContents: () =>
    [
      'declare module \'*.vue\' {',
      '  import { DefineComponent } from \'@vue/runtime-core\'',
      '  const component: DefineComponent<{}, {}, any>',
      '  export default component',
      '}'
    ].join('\n')
}

// TODO: Use an alias
export const appComponentTemplate = {
  filename: 'app-component.mjs',
  getContents: (ctx: TemplateContext) => genExport(ctx.app.mainComponent, ['default'])
}
// TODO: Use an alias
export const rootComponentTemplate = {
  filename: 'root-component.mjs',
  getContents: (ctx: TemplateContext) => genExport(ctx.app.rootComponent, ['default'])
}

export const cssTemplate = {
  filename: 'css.mjs',
  getContents: (ctx: TemplateContext) => ctx.nuxt.options.css.map(i => genImport(i)).join('\n')
}

export const clientPluginTemplate = {
  filename: 'plugins/client.mjs',
  getContents (ctx: TemplateContext) {
    const clientPlugins = ctx.app.plugins.filter(p => !p.mode || p.mode !== 'server')
    return [
      templateUtils.importSources(clientPlugins.map(p => p.src)),
      `export default ${genArrayFromRaw(clientPlugins.map(p => templateUtils.importName(p.src)))}`
    ].join('\n')
  }
}

export const serverPluginTemplate = {
  filename: 'plugins/server.mjs',
  getContents (ctx: TemplateContext) {
    const serverPlugins = ctx.app.plugins.filter(p => !p.mode || p.mode !== 'client')
    return [
      "import preload from '#app/plugins/preload.server'",
      templateUtils.importSources(serverPlugins.map(p => p.src)),
      `export default ${genArrayFromRaw([
        'preload',
        ...serverPlugins.map(p => templateUtils.importName(p.src))
      ])}`
    ].join('\n')
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

export const pluginsDeclaration = {
  filename: 'types/plugins.d.ts',
  getContents: (ctx: TemplateContext) => {
    const EXTENSION_RE = new RegExp(`(?<=\\w)(${ctx.nuxt.options.extensions.map(e => escapeRE(e)).join('|')})$`, 'g')
    const tsImports = ctx.app.plugins.map(p => (isAbsolute(p.src) ? relative(join(ctx.nuxt.options.buildDir, 'types'), p.src) : p.src).replace(EXTENSION_RE, ''))

    return `// Generated by Nuxt3'
import type { Plugin } from '#app'

type Decorate<T extends Record<string, any>> = { [K in keyof T as K extends string ? \`$\${K}\` : never]: T[K] }

type InjectionType<A extends Plugin> = A extends Plugin<infer T> ? Decorate<T> : unknown

type NuxtAppInjections = \n  ${tsImports.map(p => `InjectionType<typeof ${genDynamicImport(p, { wrapper: false })}.default>`).join(' &\n  ')}

declare module '#app' {
  interface NuxtApp extends NuxtAppInjections { }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties extends NuxtAppInjections { }
}

export { }
`
  }
}

const adHocModules = ['router', 'pages', 'auto-imports', 'meta', 'components']
export const schemaTemplate = {
  filename: 'types/schema.d.ts',
  getContents: ({ nuxt }: TemplateContext) => {
    const moduleInfo = nuxt.options._installedModules.map(m => ({
      ...m.meta || {},
      importName: m.entryPath || m.meta?.name
    })).filter(m => m.configKey && m.name && !adHocModules.includes(m.name))

    return [
      "import { NuxtModule } from '@nuxt/schema'",
      "declare module '@nuxt/schema' {",
      '  interface NuxtConfig {',
      ...moduleInfo.filter(Boolean).map(meta =>
      `    [${genString(meta.configKey)}]?: typeof ${genDynamicImport(meta.importName, { wrapper: false })}.default extends NuxtModule<infer O> ? Partial<O> : Record<string, any>`
      ),
      '  }',
      '}'
    ].join('\n')
  }
}

// Add middleware template
export const middlewareTemplate = {
  filename: 'middleware.mjs',
  async getContents () {
    const middleware = await resolveMiddleware()
    const globalMiddleware = middleware.filter(mw => mw.global)
    const namedMiddleware = middleware.filter(mw => !mw.global)
    const namedMiddlewareObject = genObjectFromRawEntries(namedMiddleware.map(mw => [mw.name, genDynamicImport(mw.path)]))
    return [
      ...globalMiddleware.map(mw => genImport(mw.path, getImportName(mw.name))),
      `export const globalMiddleware = ${genArrayFromRaw(globalMiddleware.map(mw => getImportName(mw.name)))}`,
      `export const namedMiddleware = ${namedMiddlewareObject}`
    ].join('\n')
  }
}
