import { Component } from '../types'

export function findComponent (components: Component[], name:string) {
  return components.find(({ pascalName, kebabName }) => [pascalName, kebabName].includes(name))
}

export function transform (content: string, components: Component[]) {
  let num = 0
  let imports = ''
  const map = new Map<Component, string>()

  // replace `_resolveComponent("...")` to direct import
  const newContent = content.replace(/ _resolveComponent\("(.*?)"\)/g, (full, name) => {
    const component = findComponent(components, name)
    if (component) {
      const identifier = map.get(component) || `__nuxt_component_${num++}`
      map.set(component, identifier)
      imports += `import ${identifier} from "${component.filePath}";`
      return ` ${identifier}`
    }
    // no matched
    return full
  })

  return `${imports}\n${newContent}`
}
