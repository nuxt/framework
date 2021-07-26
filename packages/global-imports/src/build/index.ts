import { createUnplugin } from 'unplugin'
import { Identifier } from '../types'

export const BuildPlugin = createUnplugin((identifers: Identifier[]) => ({
  name: 'nuxt-global-imports-build',
  transformInclude (code, id) {
    return false
  },
  transform (code, id) {
    return code
  }
}))
