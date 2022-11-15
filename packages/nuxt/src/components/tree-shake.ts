import { pathToFileURL } from 'node:url'
import { parseURL } from 'ufo'
import MagicString from 'magic-string'
import { walk } from 'estree-walker'
import type { CallExpression, Property, Identifier, ImportDeclaration } from 'estree'
import { createUnplugin } from 'unplugin'

interface TreeShakeTemplatePluginOptions {
  sourcemap?: boolean
}

type AcornNode<N> = N & { start: number, end: number }

export const TreeShakeTemplatePlugin = createUnplugin((options: TreeShakeTemplatePluginOptions) => {
  return {
    name: 'nuxt:tree-shake-template',
    enforce: 'post',
    transformInclude (id) {
      const { pathname } = parseURL(decodeURIComponent(pathToFileURL(id).href))
      return pathname.endsWith('.vue')
    },
    transform (code, id) {
      const CLIENTONLY_RE = /[c|C]lient[_|-]?[O|o]nly/
      const hasClientOnly = CLIENTONLY_RE.test(code)
      if (!hasClientOnly) { return }

      const s = new MagicString(code)
      const SSR_RENDER_RE = /ssrRenderComponent/
      const parse = this.parse
      const importDeclarations: AcornNode<ImportDeclaration>[] = []

      walk(parse(code, { sourceType: 'module', ecmaVersion: 'latest' }), {
        enter (_node) {
          const node = _node as AcornNode<CallExpression | ImportDeclaration>
          if (node.type === 'ImportDeclaration') {
            importDeclarations.push(node)
          } else if (node.type === 'CallExpression' &&
            node.callee.type === 'Identifier' &&
            SSR_RENDER_RE.test(node.callee.name)) {
            const [identifier, _, children] = node.arguments
            if (identifier.type === 'Identifier' && CLIENTONLY_RE.test(identifier.name)) {
              if (children?.type === 'ObjectExpression') {
                const defaultSlot = children.properties.find(prop => prop.type === 'Property' && prop.key.type === 'Identifier' && prop.key.name === 'default') as AcornNode<Property>

                if (defaultSlot) {
                  s.remove(defaultSlot.start, defaultSlot.end + 1)
                  const removedCode = code.slice(defaultSlot.start, defaultSlot.end + 1)
                  const componentsSet = new Set<string>()
                  const currentCode = s.toString()
                  walk(parse('({' + removedCode + '})', { sourceType: 'module', ecmaVersion: 'latest' }), {
                    enter (_node) {
                      const node = _node as AcornNode<CallExpression>
                      if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && SSR_RENDER_RE.test(node.callee.name)) {
                        const componentNode = node.arguments[0]
                        if (componentNode.type === 'CallExpression') {
                          // expect componentNode to be an unref()
                          const identifier = componentNode.arguments[0] as Identifier
                          const isUsedOutsideClientOnly = new RegExp(`ssrRenderComponent\\((${(componentNode.callee as Identifier).name}\\()?${identifier.name}`).test(currentCode)
                          if (!isUsedOutsideClientOnly) { componentsSet.add(identifier.name) }
                        } else {
                          // expect componentNode to be an identifier
                          const isUsedOutsideClientOnly = new RegExp(`ssrRenderComponent\\(${(componentNode as Identifier).name}`).test(currentCode)
                          if (!isUsedOutsideClientOnly) { componentsSet.add((componentNode as Identifier).name) }
                        }
                      }
                    }
                  })
                  const component = [...componentsSet]
                  for (const componentName of component) {
                    let removed = false
                    // remove const _component_ = resolveComponent...
                    const VAR_RE = new RegExp(`(?:const|let|var) ${componentName} = ([^;]*);`)
                    s.replace(VAR_RE, () => {
                      removed = true
                      return ''
                    })
                    if (!removed) {
                      // remove direct import
                      const declaration = findImportDeclaration(importDeclarations, componentName)
                      if (declaration) {
                        if (declaration.specifiers.length > 1) {
                          const componentSpecifier = declaration.specifiers.find(s => s.local.name === componentName) as AcornNode<Identifier> | undefined

                          if (componentSpecifier) { s.remove(componentSpecifier.start, componentSpecifier.end) }
                        } else {
                          s.remove(declaration.start, declaration.end)
                        }
                      }
                    }
                  }
                }
              }
            }
          }
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

/**
 * find and return the importDeclaration that contain the import specifier
 *
 * @param {AcornNode<ImportDeclaration>[]} declarations - list of import declarations
 * @param {string} importName - name of the import
 */
function findImportDeclaration (declarations: AcornNode<ImportDeclaration>[], importName: string): AcornNode<ImportDeclaration> | undefined {
  const declaration = declarations.find((d) => {
    const specifier = d.specifiers.find(s => s.local.name === importName)
    if (specifier) { return true }
    return false
  })

  if (declaration) { return declaration }
}
