import { Component } from '../types'

export function findComponent (components: Component[], name:string) {
  return components.find(({ pascalName, kebabName }) => [pascalName, kebabName].includes(name))
}

export function transform (content: string, components: Component[]) {
  let num = 0
  let imports = ''

  const newContent = content.replace(/ _resolveComponent\("(.*?)"\)/g, (full, name) => {
    const component = findComponent(components, name)
    if (component) {
      const identifier = `__nuxt_component_${num++}`
      imports += `import ${identifier} from "${component.filePath}";`
      return ` ${identifier}`
    }
    // no matched
    return full
  })

  return imports + '\n' + newContent
}
