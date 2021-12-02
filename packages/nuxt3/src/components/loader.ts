import { createUnplugin } from 'unplugin'
import { parseQuery, parseURL } from 'ufo'
import { Component } from '@nuxt/schema'
import { getComponentPath } from './templates'

interface LoaderOptions {
  getComponents(): Component[]
  mode: 'server' | 'client'
}

export const loaderPlugin = createUnplugin((options: LoaderOptions) => ({
  name: 'nuxt-components-loader',
  enforce: 'post',
  transformInclude (id) {
    const { pathname, search } = parseURL(id)
    const query = parseQuery(search)
    // we only transform render functions
    // from `type=template` (in Webpack) and bare `.vue` file (in Vite)
    return pathname.endsWith('.vue') && (query.type === 'template' || !search)
  },
  transform (code) {
    return transform(code, options.getComponents(), options.mode)
  }
}))

function findComponent (components: Component[], name:string) {
  return components.find(({ pascalName, kebabName }) => [pascalName, kebabName].includes(name))
}

function transform (content: string, components: Component[], mode: 'server' | 'client') {
  let num = 0
  let imports = ''
  const map = new Map<Component, string>()
  let hasEnvComponents = false

  // replace `_resolveComponent("...")` to direct import
  const newContent = content.replace(/ _resolveComponent\("(.*?)"\)/g, (full, name) => {
    const component = findComponent(components, name)
    if (component) {
      const identifier = map.get(component) || `__nuxt_component_${num++}`
      map.set(component, identifier)
      imports += `import ${identifier} from "${getComponentPath(component, mode)}";`
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

  return `${imports}\n${newContent}`
}
