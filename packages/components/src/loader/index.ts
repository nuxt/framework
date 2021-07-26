import { createUnplugin } from 'unplugin'
import { parseQuery, parseURL } from 'ufo'
import { Component } from '../types'
import { transform } from './transform'

interface LoaderOptions {
  getComponents(): Component[]
}

export const LoaderPlugin = createUnplugin((options: LoaderOptions) => ({
  name: 'nuxt-components-loader',
  enforce: 'post',
  transformInclude (id) {
    const { pathname, search } = parseURL(id)
    const query = parseQuery(search)
    if (!pathname.endsWith('.vue')) {
      return false
    }
    return query.type !== 'style'
  },
  transform (code) {
    return transform(code, options.getComponents())
  }
}))
