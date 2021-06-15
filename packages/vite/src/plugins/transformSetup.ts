import qs from 'querystring'
import type { Plugin } from 'vite'

export interface VueQuery {
  vue?: boolean
  src?: boolean
  type?: 'script' | 'template' | 'style' | 'custom'
  index?: number
  lang?: string
  raw?: boolean
  nuxt?: boolean
}

export function parseVueRequest (id: string): {
  filename: string
  query: VueQuery
} {
  const [filename, rawQuery] = id.split('?', 2)
  const query = qs.parse(rawQuery) as VueQuery
  if (query.vue != null) {
    query.vue = true
  }
  if (query.src != null) {
    query.src = true
  }
  if (query.index != null) {
    query.index = Number(query.index)
  }
  if (query.raw != null) {
    query.raw = true
  }
  if (query.nuxt != null) {
    query.nuxt = true
  }
  return {
    filename,
    query
  }
}

export function transformNuxtSetup () {
  return <Plugin> {
    name: 'nuxt:transform-setup',
    transform (code, id) {
      const { filename, query } = parseVueRequest(id)
      if (filename.endsWith('.vue') || (query.nuxt && query.type === 'script')) {
        if (code.includes('_defineComponent(')) {
          return 'import { defineNuxtComponent as _defineNuxtComponent } from "@nuxt/app"\n' + code.replace('_defineComponent(', '_defineNuxtComponent(')
        }
      }
    }
  }
}
