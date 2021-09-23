
import { relative } from 'upath'

import type { Component } from './types'

export type ComponentsTemplateOptions = {
  buildDir?: string
  components: Component[]
}

export type ImportMagicCommentsOptions = {
  chunkName:string
  prefetch?: boolean | number
  preload?: boolean | number
}

const createImportMagicComments = (options: ImportMagicCommentsOptions) => {
  const { chunkName, prefetch, preload } = options
  return [
    `webpackChunkName: "${chunkName}"`,
    prefetch === true || typeof prefetch === 'number' ? `webpackPrefetch: ${prefetch}` : false,
    preload === true || typeof preload === 'number' ? `webpackPreload: ${preload}` : false
  ].filter(Boolean).join(', ')
}

export const componentsTemplate = {
  filename: 'components.mjs',
  getContents (options: ComponentsTemplateOptions) {
    return `import { defineAsyncComponent } from 'vue'

const components = {
${options.components.map((c) => {
  const exp = c.export === 'default' ? 'c.default || c' : `c['${c.export}']`
  const magicComments = createImportMagicComments(c)

  return `  '${c.pascalName}': defineAsyncComponent(() => import('${c.filePath}' /* ${magicComments} */).then(c => ${exp}))`
}).join(',\n')}
}

export default function (nuxt) {
  for (const name in components) {
    nuxt.app.component(name, components[name])
    nuxt.app.component('Lazy' + name, components[name])
  }
}
`
  }
}

export const componentsTypeTemplate = {
  filename: 'components.d.ts',
  write: true,
  getContents: (options: ComponentsTemplateOptions) => `// Generated by components discovery
declare module 'vue' {
  export interface GlobalComponents {
${options.components.map(c => `    '${c.pascalName}': typeof import('${relative(options.buildDir, c.filePath)}')['${c.export}']`).join(',\n')}
  }

  export {}
}`
}
