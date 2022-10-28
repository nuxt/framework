import { genImport } from 'knitwork'
import { createUnplugin } from 'unplugin'
import { ComponentsOptions } from '@nuxt/schema'
import MagicString from 'magic-string'
import { isAbsolute, relative } from 'pathe'
import { hash } from 'ohash'
import { parse } from 'acorn'
import { walk } from 'estree-walker'
import type { Node, ReturnStatement } from 'estree'
import { isVueTemplate } from './helpers'
interface LoaderOptions {
  sourcemap?: boolean
  transform?: ComponentsOptions['transform'],
  rootDir: string
}

export const clientFallbackAutoIdPlugin = createUnplugin((options: LoaderOptions) => {
  const exclude = options.transform?.exclude || []
  const include = options.transform?.include || []

  return {
    name: 'nuxt:client-fallback-auto-id',
    enforce: 'post',
    transformInclude (id) {
      if (exclude.some(pattern => id.match(pattern))) {
        return false
      }
      if (include.some(pattern => id.match(pattern))) {
        return true
      }
      return isVueTemplate(id)
    },
    transform (code, id) {
      const uidkey = 'clientFallbackUid$'
      if (code.includes(uidkey) || !/[cC]lient-?[fF]allback/.test(code)) { return }

      const s = new MagicString(code)
      const relativeID = isAbsolute(id) ? relative(options.rootDir, id) : id
      const imports = new Set()
      let count = 0
      // ctx argument name for render function
      let renderCtx: string|undefined = /(?:function ?)(?:_sfc_render|_sfc_ssrRender|ssrRender|render)\(([^,]*)(?:,)/g.exec(code)?.[1]
      const isStateful = /setup ?\((.*)\) ?{/g.test(code)

      const ast = parse(code, { ecmaVersion: 'latest', sourceType: 'module' })
      walk(ast, {
        // @ts-expect-error - see https://github.com/Rich-Harris/estree-walker/pull/24
        enter (node: Node) {
          // replace setup return statement
          if (node.type === 'Property' && node.key.type === 'Identifier' && node.key.name === 'setup' && node.value.type === 'FunctionExpression') {
            const returnStatement = node.value.body.body.find(n => n.type === 'ReturnStatement') as ReturnStatement
            if (!returnStatement) { this.skip() }
            const { argument } = returnStatement
            if (!argument) {
              this.skip()
            } else if (argument.type === 'ObjectExpression') {
              // add the uid to the return object
              // @ts-ignore
              s.appendRight(argument.start + 1, uidkey + ',')
            } else if (argument.type === 'Identifier') {
              // dev only
              // expect to be an object -- destructure it
              // @ts-ignore
              s.overwrite(argument.start, argument.end, ` { ...${argument.name}, ${uidkey}}`)
            } else if (argument.type === 'ArrowFunctionExpression' || argument.type === 'FunctionExpression') {
              const [param] = argument.params
              if (param && param.type === 'Identifier') {
                renderCtx = param.name
              } else {
                renderCtx = '_ctx'
                // @ts-ignore
                s.appendRight(argument.start + 1, `${renderCtx},`)
              }
            }
          } else if (node.type === 'CallExpression') {
            const { callee } = node
            if (callee.type === 'Identifier' && /(createVNode|ssrRenderComponent)/g.test(callee.name)) {
              const props = node.arguments[1]
              if (props?.type === 'Literal' && !props.value) {
                // @ts-ignore
                s.overwrite(props.start, props.end, isStateful ? `{ uid: ${renderCtx ? `${renderCtx}.${uidkey}` : `${uidkey}.value`} }` : `{uid: "${hash(relativeID)}${count}"}`)
              } else if (props?.type === 'ObjectExpression') {
                // @ts-ignore
                s.appendRight(props.start + 1, isStateful ? `uid: ${renderCtx ? `${renderCtx}.${uidkey}` : `${uidkey}.value`}  + "${count}",` : `uid: "${hash(relativeID)}${count}",`)
              }
              count++
            }
          }
        }
      })

      if (isStateful) {
        s.replace(/setup ?\((.*)\) ?{/g, (full, args) => {
          imports.add(genImport('vue', [{ name: 'computed', as: '__computed' }]))
          let [propsName, ctxName] = args.split(',')
          if (!propsName) { propsName = '_props' }
          if (!ctxName) { ctxName = '_ctx' }
          return `setup(${propsName}, ${ctxName}) {
            const ${uidkey} = __computed(() => "${hash(relativeID)}" + JSON.stringify(${propsName}));
          `
        })
      }

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
