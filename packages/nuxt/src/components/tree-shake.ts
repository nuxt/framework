import { pathToFileURL } from 'node:url'
import { parseURL } from 'ufo'
import MagicString from 'magic-string'
import { parseFragment } from 'parse5'
import type { DocumentFragment, ChildNode } from 'parse5/dist/tree-adapters/default'
import { createUnplugin } from 'unplugin'
import type { Component } from '@nuxt/schema'

interface TreeShakeTemplatePluginOptions {
  sourcemap?: boolean
  getComponents (): Component[]
}

export const TreeShakeTemplatePlugin = createUnplugin((options: TreeShakeTemplatePluginOptions) => {
  return {
    name: 'nuxt:tree-shake-template',
    enforce: 'pre',
    transformInclude (id) {
      const { pathname } = parseURL(decodeURIComponent(pathToFileURL(id).href))
      return pathname.endsWith('.vue')
    },
    transform (code, id) {
      const template = code.match(/<template>([\s\S]*)<\/template>/)
      if (!template) { return }

      const components = options.getComponents()

      const clientOnlyComponents = components
        .filter(c => c.mode === 'client' && !components.some(other => other.mode !== 'client' && other.pascalName === c.pascalName))
        .flatMap(c => [c.pascalName.toLowerCase(), c.kebabName])
        .concat(['clientonly', 'client-only'])

      const s = new MagicString(code)

      const ast = parseFragment(code, { sourceCodeLocationInfo: true })
      walkFragment(ast, (node) => {
        if (node && 'tagName' in node && clientOnlyComponents.includes(node.tagName)) {
          const fallback = node.childNodes?.find(n => n.nodeName === 'template' && n.attrs?.find(a => a.name.includes('fallback') || a.name.includes('placeholder')))
          const text = fallback ? code.slice(fallback.sourceCodeLocation!.startOffset, fallback.sourceCodeLocation!.endOffset) : ''
          // Replace node content
          s.overwrite(node.childNodes[0].sourceCodeLocation!.startOffset, node.childNodes[node.childNodes.length - 1].sourceCodeLocation!.endOffset, text)
          return false
        }
      })

      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: options.sourcemap
            ? s.generateMap({ source: id, includeContent: true })
            : undefined
        }
      }
    }
  }
})

function walkFragment (node: ChildNode | DocumentFragment, callback: (node?: ChildNode | DocumentFragment) => false | void) {
  if (callback(node) === false || !('childNodes' in node)) {
    return false
  }

  for (const child of [...node.childNodes || [], ...'content' in node ? node.content.childNodes : []]) {
    walkFragment(child, callback)
  }
}
