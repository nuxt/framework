import { ViteBuildContext } from "../vite"
import escapeRegExp from 'escape-string-regexp'
import { normalize } from 'pathe'

export function transpile (ctx: ViteBuildContext) {
  const transpile = []

  for (let pattern of ctx.nuxt.options.build.transpile) {
    if (typeof pattern === 'function') {
      pattern = pattern(ctx)
    }
    if (typeof pattern === 'string') {
      transpile.push(new RegExp(escapeRegExp(normalize(pattern))))
    } else if (pattern instanceof RegExp) {
      transpile.push(pattern)
    }
  }

  return transpile
}
