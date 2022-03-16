import { pathToFileURL } from 'url'
import { createUnplugin } from 'unplugin'
import { parseQuery, parseURL } from 'ufo'
import { Component } from '@nuxt/schema'
import { genImport } from 'knitwork'
import MagicString from 'magic-string'
import { getComponentPath } from './templates'

interface LoaderOptions {
  getComponents(): Component[]
  mode: 'server' | 'client'
}

export const loaderPlugin = createUnplugin((options: LoaderOptions) => ({
  name: 'nuxt:components-loader',
  enforce: 'post',
  transformInclude (id) {
    const { pathname, search } = parseURL(decodeURIComponent(pathToFileURL(id).href))
    const query = parseQuery(search)
    // we only transform render functions
    // from `type=template` (in Webpack) and bare `.vue` file (in Vite)
    return pathname.endsWith('.vue') && (query.type === 'template' || !search)
  },
  transform (code, id) {
    return transform(code, id, options.getComponents(), options.mode)
  }
}))

function findComponent (components: Component[], name:string) {
  return components.find(({ pascalName, kebabName }) => [pascalName, kebabName].includes(name))
}

function transform (code: string, id: string, components: Component[], mode: 'server' | 'client') {
  let num = 0
  let imports = ''
  const map = new Map<Component, string>()
  const s = new MagicString(code)
  let hasEnvComponents = false

  // replace `_resolveComponent("...")` to direct import
  s.replace(/ _resolveComponent\("(.*?)"\)/g, (full, name) => {
    const component = findComponent(components, name)
    if (component) {
      const identifier = map.get(component) || `__nuxt_component_${num++}`
      map.set(component, identifier)
      imports += genImport(getComponentPath(component, mode), [{ name: component.export, as: identifier }])
      if (component.envPaths) {
        hasEnvComponents = true
        return ` wrapClientOnly(${identifier}, '${mode}')`
      }
      return ` ${identifier}`
    }
    // no matched
    return full
  })

  if (hasEnvComponents) {
    imports = 'import { wrapClientOnly } from \'#app/components/client-only\';' + imports
  }

  if (imports) {
    s.prepend(imports + '\n')
  }

  if (s.hasChanged()) {
    return {
      code: s.toString(),
      map: s.generateMap({ source: id, includeContent: true })
    }
  }
}
