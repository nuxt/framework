import { pathToFileURL } from 'node:url'
import MagicString from 'magic-string'
import { walk } from 'estree-walker'
import { createUnplugin } from 'unplugin'
import { parseURL } from 'ufo'
import type { ArrowFunctionExpression, CallExpression, ExpressionStatement, Identifier, Property, FunctionDeclaration, BlockStatement } from 'estree'
import { genImport } from 'knitwork'

type AcornNode<N> = N & {start: number, end: number}

interface ClientNextTickPluginnOptions {
    sourcemap?: boolean
  }

/**
 * this plugin adds an `await nextTick();` to all onMounted hook callbacks for a .client component
 *
 * This is needed due to the nature of `createClientOnly()` that modifies a component to be rendered once mounted
 * which means that the `onMounted` hook is already ran when rendering the template for the first time
 *
 * @see https://github.com/nuxt/framework/issues/9185
 */
export const clientNextTickPlugin = createUnplugin((options: ClientNextTickPluginnOptions) => {
  return {
    name: 'nuxt:client-nextTick',
    enforce: 'post',
    transformInclude (id) {
      const { pathname } = parseURL(decodeURIComponent(pathToFileURL(id).href))
      return pathname.endsWith('.client.vue') || pathname.endsWith('.client.ts') || pathname.endsWith('.client.js')
    },
    transform (code, id) {
      // webpack twice transformed workaround
      if (code.includes(genImport('vue', [{ name: 'nextTick', as: '__nextTick' }]))) { return }

      const s = new MagicString(code)
      const imports = new Set<string>()

      walk(this.parse(code, {
        sourceType: 'module',
        ecmaVersion: 'latest'
      }), {
        enter (_node) {
          const node = _node as Property
          // find setup() as a property
          if (node.type === 'Property' &&
                (node.key as Identifier).name === 'setup' &&
                (node.value.type === 'FunctionExpression' || node.value.type === 'ArrowFunctionExpression')
          ) {
            const setupBody = node.value.body as BlockStatement
            const onMountedExpression = setupBody.body.find((node) => {
              return node.type === 'ExpressionStatement' &&
                 node.expression.type === 'CallExpression' &&
                 (node.expression.callee as Identifier).name === 'onMounted'
            }) as ExpressionStatement

            if (onMountedExpression) {
              const [onMountedCallbackExpression] = (onMountedExpression.expression as CallExpression).arguments

              if (onMountedCallbackExpression.type === 'ArrowFunctionExpression' || onMountedCallbackExpression.type === 'FunctionExpression') {
                const isAsync = onMountedCallbackExpression.async
                imports.add(genImport('vue', [{ name: 'nextTick', as: '__nextTick' }]))
                s.appendRight((onMountedCallbackExpression.body as AcornNode<ArrowFunctionExpression|FunctionDeclaration>).start + 1, 'await __nextTick();')

                // convert onMounted callback to async
                if (!isAsync) {
                  s.appendLeft((onMountedCallbackExpression as AcornNode<ArrowFunctionExpression|FunctionDeclaration>).start, 'async ')
                }
              }
            }
          }
        }
      })

      if (imports.size) {
        s.prepend([...imports, ''].join('\n'))
      }

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
