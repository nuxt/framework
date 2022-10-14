import { useNuxt } from '@nuxt/kit'
import escapeRegExp from 'escape-string-regexp'
import { normalize } from 'pathe'

interface Envs {
  isDev: boolean
  isClient?: boolean
  isServer?: boolean
}

export function transpile (envs: Envs): RegExp[] {
  const nuxt = useNuxt()
  const transpile = []

  for (let pattern of nuxt.options.build.transpile) {
    if (typeof pattern === 'function') {
      pattern = pattern(envs)
    }
    if (typeof pattern === 'string') {
      transpile.push(new RegExp(escapeRegExp(normalize(pattern))))
    } else if (pattern instanceof RegExp) {
      transpile.push(pattern)
    }
  }

  return transpile
}
