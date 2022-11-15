import { pathToFileURL } from 'node:url'
import { parseURL } from 'ufo'
import MagicString from 'magic-string'
import { walk } from 'estree-walker'
import type { CallExpression, Property, Identifier, ImportDeclaration, MemberExpression, Literal, ReturnStatement, VariableDeclaration, ObjectExpression } from 'estree'
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
                          const identifier = componentNode.arguments[0] as Identifier
                          if (!isRenderedInCode(currentCode, identifier.name)) { componentsSet.add(identifier.name) }
                        } else if (componentNode.type === 'Identifier' && !isRenderedInCode(currentCode, componentNode.name)) {
                          componentsSet.add(componentNode.name)
                        } else if (componentNode.type === 'MemberExpression') {
                          // expect componentNode to be a memberExpression (mostly used in dev with $setup[])
                          const { start, end } = componentNode as AcornNode<MemberExpression>
                          if (!isRenderedInCode(currentCode, code.slice(start, end))) {
                            componentsSet.add(((componentNode as MemberExpression).property as Literal).value as string)
                            // remove the component from the return statement of `setup()`
                            walk(parse(code, { sourceType: 'module', ecmaVersion: 'latest' }), {
                              enter (_node) {
                                const node = _node as Property
                                if (node.type === 'Property' && node.key.type === 'Identifier' && node.key.name === 'setup' && node.value.type === 'FunctionExpression') {
                                  const returnStatement = node.value.body.body.find(n => n.type === 'ReturnStatement') as ReturnStatement | undefined
                                  if (returnStatement?.argument?.type === 'Identifier') {
                                    const returnIdentifier = returnStatement.argument.name
                                    const returnedDeclaration = node.value.body.body.find(n => n.type === 'VariableDeclaration' && (n.declarations[0].id as Identifier).name === returnIdentifier) as AcornNode<VariableDeclaration>
                                    const componentProperty = (returnedDeclaration?.declarations[0].init as ObjectExpression)?.properties.find(p => ((p as Property).key as Identifier).name === ((componentNode as MemberExpression).property as Literal).value) as AcornNode<Property>
                                    if (componentProperty) { s.remove(componentProperty.start, componentProperty.end + 1) }
                                  } else if (returnStatement?.argument?.type === 'ObjectExpression') {
                                    const componentProperty = returnStatement.argument?.properties.find(p => ((p as Property).key as Identifier).name === ((componentNode as MemberExpression).property as Literal).value) as AcornNode<Property>
                                    if (componentProperty) { s.remove(componentProperty.start, componentProperty.end + 1) }
                                  }
                                }
                              }
                            })
                          }
                        }
                      }
                    }
                  })
                  const components = [...componentsSet]
                  for (const componentName of components) {
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

/**
 * test if the name argument is used to render a component in the code
 *
 * @param code code to test
 * @param name component name
 */
function isRenderedInCode (code: string, name: string) {
  return new RegExp(`ssrRenderComponent\\(${escapeRegExp(name)}`).test(code)
}

function escapeRegExp (string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
